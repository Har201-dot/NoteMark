import { ActionButton, ActionButtonProps } from '@/components'
import { deleteNoteAtom } from '@/store'
import { useSetAtom } from 'jotai'
import { FaTrashCan } from 'react-icons/fa6'

export const DeleteNoteButton = ({ ...props }: ActionButtonProps) => {
  const deleteNote = useSetAtom(deleteNoteAtom)

  const handleDelete = async () => {
    deleteNote()
  }

  return (
    <ActionButton onClick={handleDelete} {...props}>
      <FaTrashCan className="w-4 h-4 text-zinc-300" />
    </ActionButton>
  )
}
