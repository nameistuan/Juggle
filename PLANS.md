# Juggle Future Plans

A roadmap of features, improvements, and architectural goals for the Juggle app.

---

## 🚀 High Priority (Soon)

### User Onboarding & First Run
- [ ] **Empathetic Onboarding**: When a user has zero data, show a welcoming overlay or empty state card: *"What are you juggling right now?"*
- [ ] **Project Quick-Start**: A guided wizard to create the first 3 projects (e.g., School, Work, Personal).
- [ ] **Interactive Tutorial**: Subtle pulse animations to guide the user towards the `+ New Event` button.

### Kanban Enhancements
- [ ] **Overdue Highlights**: Visually flag tasks whose `dueDate` has passed.
- [ ] **Subtask Progress**: Show a progress indicator (e.g., "2/5 items") on the card based on Tiptap checklist items.
- [ ] **Column Density**: Support for "compact" vs "comfortable" Kanban card views.

## ⚡ Efficiency & Shortcuts
- [ ] **Event Duplication**: Support for `Ctrl+C` / `Ctrl+V` (or `Cmd+C/V`) to quickly clone events or tasks on the calendar/kanban board.
- [ ] **Quick Creation**: `Shift + N` to open the creation modal from anywhere.

---

## 🛠 Stability & DX

### State & Reliability
- [ ] **Optimistic Sync**: Even more robust handling of offline/slow connections for drag-and-drop.
- [ ] **Search Refinement**: Advanced filters (filter by project, status, or date range).

---

## 🎨 Visuals & UX
- [ ] **Project Icons**: Add support for simple icons (lucide-react) next to project names.
- [ ] **Dark Mode Refinement**: Ensure perfect contrast for indigo/vibrant project colors in dark mode.
- [ ] **Transitions**: Smoother height transitions when expanding/collapsing Kanban sections.

---

## 💡 Ideas & Research
- [ ] **AI Prioritization**: Suggest which tasks to "Juggle" onto today's calendar based on deadlines.
- [ ] **Collaboration**: Shared projects for group classes (e.g., CS429 project teams).
- [ ] **Mobile App**: PWA or React Native companion for quick task entry.
