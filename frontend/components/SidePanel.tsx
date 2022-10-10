import { ChangeEvent, useContext, useState } from "react";
import FiberItem from "./FiberItem";
import Section from "./Section";
import { ImageContext } from "./App";
import Item from "./Item";
import { AiOutlinePlus, AiOutlineThunderbolt, AiFillThunderbolt } from "react-icons/ai";
import randomColor from "randomcolor";
import { asyncRun } from '../worker/py-worker'

interface Props {
  isValidScale: boolean;
  onScaleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
const SidePanel = (props: Props) => {
  const { scaleLength, fibers, setFibers, setMagnitude } = useContext(ImageContext)!;
  const [thunder, setThunder] = useState(<AiOutlineThunderbolt/>)
  const addFiber = () => {
    let newFibers = [...fibers]
    const newId = Math.max(...fibers.map(fiber => fiber.id)) + 1;

    newFibers.push({
      id: newId,
      color: randomColor(),
      diameter: 0,
      measurements: [
        {
          id: 0,
          type: "line",
          startX: 0.11,
          startY: 0.21,
          endX: 0.31,
          endY: 0.41,
        },
      ],
    });
    setFibers(newFibers);
  };

  const runInference = async () => {
    setThunder(<AiFillThunderbolt/>)
    let res = await asyncRun();
    console.log(res)
    console.log(JSON.parse(res.fiber_meas))
    // await new Promise(resolve => setTimeout(resolve, 1000));
    setThunder(<AiOutlineThunderbolt/>)
  };

  return (
    <div
      id='side-panel'
      className='flex flex-col justify-between w-1/4 text-sm min-w-max bg-slate-300'
    >
      <Section
        className='overflow-auto'
        id='fibers'
        title='Fibers'
        actions={
          <div>
            <button
              className='btn btn-xs btn-square btn-ghost'
              onClick={runInference}
            >
            {thunder}
            </button>
            <button
              className='btn btn-xs btn-square btn-ghost'
              onClick={addFiber}
            >
              <AiOutlinePlus />
            </button>
          </div>
        }
      >
        {fibers.map((fiber, key) => {
          const addMeasurement = () => {
            let newFibers = [...fibers];

            const newId = newFibers[key].measurements.length;

            newFibers[key].measurements.push({
              id: newId,
              type: "line",
              startX: 0.11,
              startY: 0.21,
              endX: 0.31,
              endY: 0.41,
            });
            setFibers(newFibers);
          };
          const removeFiber = () => {
            setFibers((prevFibers) => {
              prevFibers.splice(key,1)
              return [...prevFibers];
            });
          };
          return (
            <FiberItem
              key={fiber.id}
              addMeasurement={addMeasurement}
              removeFiber={removeFiber}
              {...fiber}
            />
          );
        })}
      </Section>
      <Section className='min-h-max overflow-none' id='globals' title='Globals'>
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
          <select
            className='w-16 m-1 rounded-sm select select-ghost select-xs'
            onChange={(event) => setMagnitude(event.target.value)}
            defaultValue='nm'
          >
            <option value='nm'>nm</option>
            <option value='µm'>µm</option>
            <option value='mm'>mm</option>
          </select>
        </Item>
      </Section>
    </div>
  );
};

export default SidePanel;
