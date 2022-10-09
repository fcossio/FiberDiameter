import { ChangeEvent, useContext } from "react";
import FiberItem, { Props as FiberItemProps } from "./FiberItem";
import Section from "./Section";
import { ImageContext } from "./App";
import Item from "./Item";

interface Props {
  fibers: FiberItemProps[];
  isValidScale: boolean;
  onScaleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
const SidePanel = (props: Props) => {
  const { scaleLength } = useContext(ImageContext)!;
  return (
    <div
      id='side-panel'
      className='flex flex-col justify-between w-1/4 text-sm min-w-max bg-slate-300'
    >
      <Section className='' id='fibers' title='Fibers'>
        {props.fibers.map((fiber) => (
          <FiberItem key={fiber.id} {...fiber} />
        ))}
      </Section>
      <Section className='' id='globals' title='Globals'>
        <Item>
          <p>Scale length: </p>
          <input
            type='number'
            className={
              "input input-xs input-ghost w-20 m-1 rounded-sm " +
              `${props.isValidScale || "input-error"}`
            }
            onChange={props.onScaleChange}
            defaultValue={scaleLength}
          />
          <select className='w-16 m-1 rounded-sm select select-ghost select-xs'>
            <option>nm</option>
          </select>
        </Item>
      </Section>
    </div>
  );
};

export default SidePanel;
