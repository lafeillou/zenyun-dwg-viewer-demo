import React, { useEffect, useRef, useState } from 'react'
// import {useSuspenseQuery} from '@tanstack/react-query'
// import {getFruits} from 'api/fruits'
// import {Fruit} from 'components/Fruit'
// import {Head} from 'components/Head'
import './default.css'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Dwg_File_Type, LibreDwg } from '@mlightcad/libredwg-web'
import { Helper } from '@/dfx/index.js'
import DThreeWrap from '@/pages/DThreeWrap'
import * as d3 from 'd3'
let editor = null
let libredwg = null
export function Viewer() {
  const inputRef = useRef<HTMLInputElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [jsonModel, setJsonModel] = useState(null)
  const [d3wrap, setD3Wrap] = useState({
    width: 640,
    height: 400,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  })
  const currentTransform = useRef<d3.ZoomTransform | null>(null)

  function setTransform(transform) {
    currentTransform.current = transform
  }
  function dragstarted(event) {
    const g = d3.select(this)
    // .raise();
    // g.raise();
    g.attr('cursor', 'grabbing')
  }

  function dragged(event, d) {
    console.log(event.x)
    console.log(event.y)
    console.log(event)
    const [x, y] = currentTransform.current.invert([
      event.sourceEvent.clientX,
      event.sourceEvent.clientY,
    ])
    console.log(x, y)
    d3.select(this).attr('transform', `translate(${x}, ${y})`)
  }

  function dragended() {
    const g = d3.select(this)
    g.attr('cursor', 'grab')
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // create a FileReader to read the file
      const reader = new FileReader()
      // define the callback function for when the file is read
      reader.onload = function (e) {
        const fileContent = e.target.result
        try {
          const dwg = libredwg.dwg_read_data(fileContent, Dwg_File_Type.DWG)
          const db = libredwg.convert(dwg)
          const model = libredwg.convert(dwg)
          editor.set(model) //json展示
          setJsonModel(model) // 传递解析出来的json数据
          // svg展示
          // const svgString = libredwg.dwg_to_svg(db);
          // console.log("===svgString");
          // console.log(svgString);
          // const parser = new DOMParser();
          // const doc = parser.parseFromString(svgString, 'image/svg+xml');
          // const svg = doc.documentElement
          // svgRef.current && d3.select(svgRef.current).appendChild(svg);
          // d3.select('#d3-svg-dom-element').append(() => svg).attr('id','example1');
          // d3.select('#example1').select('defs').remove();
          // const innerSvg = d3.select('#example1').select('g').select('g');
          // console.log("====innerSvg");
          // console.log(innerSvg);
          // innerSvg.selectAll('g')
          // // .attr('stroke', 'red')
          // .call(d3.drag()
          // .on("start", dragstarted)
          // .on("drag", dragged)
          // .on("end", dragended));
          // 转换dwg为json格式，继续转换为svg格式
          console.log('====Helper')
          console.log(Helper)
          const helper = new Helper(model)
          // //json格式
          console.log(helper.parsed, 'json格式')
          // //svg  格式
          // console.log('parsed:', helper.toSVG()) // 对 dxf有效
          // //webgl 所用格式
          // console.log('polylines:', helper.toPolylines()) // 对 dxf有效
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
  }

  function renderD3Wrap() {
    const wrap = document.getElementById('d3-svg-wrap')
    const rect = wrap?.getBoundingClientRect()

    setD3Wrap((s) => {
      return {
        ...s,
        width: rect?.width || 640,
        height: rect?.height || 400,
      }
    })
  }

  function handleLayoutChange(layouts) {
    renderD3Wrap()
  }
  useEffect(() => {
    // console.log(JSONEditor);
    // console.log(Dwg_File_Type);
    // console.log(LibreDwg);
    async function initLibreDwg() {
      // load libredwg webassembly module
      libredwg = await LibreDwg.create()
      // create the editor
      const container = document.getElementById('jsoneditor')
      const options = {
        mode: 'view',
      }
      if (!editor) {
        editor = new JSONEditor(container, options)
      }
    }
    initLibreDwg()
    renderD3Wrap()
  }, [])
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full"
      style={{
        border: '1px solid #efefef',
        borderRadius: 8,
        padding: '0px 0px 0px 24px',
      }}
      onLayout={handleLayoutChange}
    >
      <ResizablePanel defaultSize={25}>
        <div
          className="grid w-full max-w-sm items-center gap-3"
          style={{ marginTop: 24, minWidth: 280 }}
        >
          <Label htmlFor="picture">请上传一个DWG格式文件</Label>
          <Input
            id="picture"
            type="file"
            accept=".dwg"
            onChange={handleInputChange}
          />
        </div>
        <div
          id="jsoneditor"
          style={{
            minWidth: 280,
            marginRight: 24,
            marginTop: 24,
            overflow: 'auto',
            height: 'calc(100vh - 180px)',
          }}
        ></div>
      </ResizablePanel>
      <ResizableHandle withHandle style={{ border: '1px solid #efefef' }} />
      <ResizablePanel defaultSize={75}>
        <div
          className="flex h-full items-center justify-center p-6"
          id="svg-container"
          style={{ display: 'none' }}
        ></div>

        <div className="h-full " id="d3-svg-wrap">
          <DThreeWrap
            width={d3wrap.width}
            height={d3wrap.height}
            ref={svgRef}
            json={jsonModel}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
