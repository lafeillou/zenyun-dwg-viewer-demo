import { Dwg_File_Type, LibreDwg } from './dist/libredwg-web.js'

// load libredwg webassembly module
const libredwg = await LibreDwg.create()

// create the editor
const container = document.getElementById('jsoneditor')
const options = {
  mode: 'view',
}
const editor = new JSONEditor(container, options)

// handle file input change event
const fileInput = document.getElementById('fileInput')
fileInput.addEventListener('change', function (event) {
  const file = event.target.files[0]
  if (file) {
    // create a FileReader to read the file
    const reader = new FileReader()

    // define the callback function for when the file is read
    reader.onload = function (e) {
      const fileContent = e.target.result
      try {
        const dwg = libredwg.dwg_read_data(fileContent, Dwg_File_Type.DWG)
        const model = libredwg.convert(dwg)
        editor.set(model)

        //
        libredwg.dwg_free(dwg)
      } catch (error) {
        console.error('Failed to process dwg file: ', error)
      }
    }

    // read the file
    reader.readAsArrayBuffer(file)
  } else {
    console.log('No file selected')
  }
})
