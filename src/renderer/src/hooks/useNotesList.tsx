import { notesAtom, selectedNotesIndexAtom } from '@renderer/store'
import { useAtom, useAtomValue } from 'jotai'

export const useNotesList = ({ onSelect }: { onSelect?: () => void }) => {
  const notes = useAtomValue(notesAtom)

  const [selectedNotesIndex, setSelectedNotesIndex] = useAtom(selectedNotesIndexAtom)

  const handleNoteSelect = (index: number) => async () => {
    setSelectedNotesIndex(index)

    if (onSelect) {
      onSelect()
    }
  }

  return {
    notes,
    selectedNotesIndex,
    handleNoteSelect
  }
}
