import type { StageProps } from '../types'
import { CanvasStage } from '@/motion'
export function Backdrop({ reducedMotion }: StageProps) {
  return <CanvasStage className="de-backdrop" animate={!reducedMotion} style={{width:"100%",height:"100%"}} draw={({ctx,width,height,t,still})=>{
    ctx.clearRect(0,0,width,height)
    ctx.strokeStyle='#e5f45418';ctx.lineWidth=1
    const y=height-24
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()
    for(let i=0;i<18;i++) {
      const x=(i*83+(still?22:t*9))%(width+60)-30
      ctx.fillStyle=i%5===0?'#ffad9860':'#e5f45435'
      if(i%5===0){ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+5,y+4);ctx.lineTo(x-5,y+4);ctx.closePath();ctx.fill()}
      else ctx.fillRect(x-3,y-3,6,6)
    }
  }} />
}
