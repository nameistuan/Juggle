export type CalendarEventItem = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  [key: string]: any;
};

export type EventWithLayout = CalendarEventItem & {
  assignedLeft: string;
  isLayoutIndented: boolean;
  zIndex: number;
};

export function calculateEventLayout(events: CalendarEventItem[]): EventWithLayout[] {
  // Sort events by start time, then end time (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = new Date(a.startTime).getTime();
    const bStart = new Date(b.startTime).getTime();
    if (aStart !== bStart) return aStart - bStart;
    
    const aEnd = a.endTime ? new Date(a.endTime).getTime() : aStart + 3600000;
    const bEnd = b.endTime ? new Date(b.endTime).getTime() : bStart + 3600000;
    return bEnd - aEnd;
  });

  const groups: CalendarEventItem[][] = [];
  let currentGroup: CalendarEventItem[] = [];
  let groupEnd = 0;

  for (const event of sortedEvents) {
    const start = new Date(event.startTime).getTime();
    const end = event.endTime ? new Date(event.endTime).getTime() : start + 3600000;

    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(event);
      groupEnd = Math.max(groupEnd, end);
    } else {
      groups.push([...currentGroup]);
      currentGroup = [event];
      groupEnd = end;
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const result: EventWithLayout[] = [];
  let globalZIndex = 1;

  for (const group of groups) {
    const layoutState: { event: CalendarEventItem; baseFraction: number; pixelIndent: number; zIndex: number }[] = [];

    // Precalculate sizes of same-start groups
    const sameStartGroups = new Map<number, number>();
    for (const event of group) {
      const start = new Date(event.startTime).getTime();
      sameStartGroups.set(start, (sameStartGroups.get(start) || 0) + 1);
    }
    const sameStartCurrentRank = new Map<number, number>();

    for (const event of group) {
      const eStart = new Date(event.startTime).getTime();
      const eEnd = event.endTime ? new Date(event.endTime).getTime() : eStart + 3600000;

      const groupSize = sameStartGroups.get(eStart) || 1;
      const currentRank = sameStartCurrentRank.get(eStart) || 0;
      sameStartCurrentRank.set(eStart, currentRank + 1);

      let overlapping = layoutState.filter(s => {
        const sStart = new Date(s.event.startTime).getTime();
        const sEnd = s.event.endTime ? new Date(s.event.endTime).getTime() : sStart + 3600000;
        return eStart < sEnd && eEnd > sStart;
      });

      let baseFraction = 0;
      let pixelIndent = 0;

      if (overlapping.length > 0) {
        // Find if we share start time with any overlap
        const sameStartOverlap = overlapping.find(s => new Date(s.event.startTime).getTime() === eStart);
        
        if (sameStartOverlap) {
          // Exact same start time -> split the fraction
          const root = sameStartOverlap;
          baseFraction = root.baseFraction + (currentRank / groupSize) * (1 - root.baseFraction);
          pixelIndent = root.pixelIndent;
        } else {
          // Waterfall -> stack pixels based on max overlapped inset
          overlapping.sort((a, b) => {
            const aScore = a.baseFraction * 1000 + a.pixelIndent;
            const bScore = b.baseFraction * 1000 + b.pixelIndent;
            return bScore - aScore;
          });
          const maxOverlap = overlapping[0];
          baseFraction = maxOverlap.baseFraction;
          pixelIndent = maxOverlap.pixelIndent + 38; // Cascade 38px for legible text
        }
      }

      layoutState.push({
        event,
        baseFraction,
        pixelIndent,
        zIndex: globalZIndex++
      });
    }

    for (const item of layoutState) {
      result.push({
        ...item.event,
        assignedLeft: `calc(${item.baseFraction * 100}% + ${item.pixelIndent}px + 2px)`,
        isLayoutIndented: item.baseFraction > 0 || item.pixelIndent > 0,
        zIndex: item.zIndex
      });
    }
  }

  return result;
}
