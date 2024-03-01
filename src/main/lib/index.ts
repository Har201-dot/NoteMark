import { appDirectoryName, fileEncoding, welcomeNoteFileName } from '@shared/constants'
import { NoteInfo } from '@shared/models'
import { CreateNote, DeleteNote, GetNotes, WriteNote } from '@shared/types'
import { dialog } from 'electron'
import { ensureDir, readFile, readdir, remove, stat, writeFile } from 'fs-extra'
import { homedir } from 'os'
import path from 'path'
import { isEmpty } from 'lodash'
import welcomeNoteFile from '../../../resources/welcomeNote.md?asset'

export const getRootDir = () => {
  return path.join(homedir(), appDirectoryName)
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()

  await ensureDir(rootDir)

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  if (isEmpty(notes)) {
    console.info('No notes found, creating welcome note')

    const content = await readFile(welcomeNoteFile, { encoding: fileEncoding })
    await writeFile(path.join(rootDir, welcomeNoteFileName), content, { encoding: fileEncoding })

    notes.push(welcomeNoteFileName)
  }

  return Promise.all(notes.map(getNoteInfoFromFileName))
}

export const getNoteInfoFromFileName = async (filename: string): Promise<NoteInfo> => {
  const fileStats = await stat(path.join(getRootDir(), filename))

  return {
    title: filename.replace(/\.md$/, ''),
    lastEditTime: fileStats.mtimeMs
  }
}

export const readNote = async (fileName: string) => {
  const rootDir = getRootDir()

  return readFile(path.join(rootDir, `${fileName}.md`), { encoding: fileEncoding })
}

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir()
  console.info(`Writing note ${filename}`)
  return writeFile(path.join(rootDir, `${filename}.md`), content, { encoding: fileEncoding })
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()

  await ensureDir(rootDir)

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'New Note',
    defaultPath: path.join(rootDir, 'Untitled.md'),
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'],
    showsTagField: false,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (canceled || !filePath) {
    console.log('Note creation canceled')
    return false
  }

  const { name: fileName, dir: parentDir } = path.parse(filePath)

  if (parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Creation failed',
      message: `All notes must be saved under ${rootDir}`
    })

    return false
  }

  console.log(`Creating note: ${filePath}`)
  await writeFile(filePath, '')

  return fileName
}

export const deleteNote: DeleteNote = async (fileName) => {
  const rootDir = getRootDir()

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Delete Note',
    message: `Are you sure you want to delete ${fileName}`,
    buttons: ['Delete', 'Cancel'], // 0 is Delete, 1 is Cancel
    defaultId: 1,
    cancelId: 1
  })

  if (response === 1) {
    console.info('Note deletion canceled')
    return false
  }

  console.info(`Deleting Note: ${fileName}`)
  await remove(path.join(rootDir, `${fileName}.md`))
  return true
}
