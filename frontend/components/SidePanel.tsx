import randomColor from "randomcolor";
import { ChangeEvent, useContext, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { IoMdColorWand } from "react-icons/io";
import { AppContext } from "./App";
import FiberItem from "./FiberItem";
import Item from "./Item";
import Section from "./Section";

interface Props {
  isValidScale: boolean;
  onScaleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
const SidePanel = (props: Props) => {
  const {
    appState: { scaleLength, isChoosingTarget },
    fibers,
    setFibers,
    addFiber,
    setAppState,
  } = useContext(AppContext)!;

  const chooseTarget = () => {
    setShowIntro(false);
    setAppState((prevAppState) => ({
      ...prevAppState,
      isChoosingTarget: !prevAppState.isChoosingTarget,
    }));
  };

  const [ showIntro, setShowIntro ] = useState(true)

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
            {showIntro? <a className="primary">Click this button ☞</a>:<></>}
            <button
              className='btn btn-xs btn-primary btn-square'
              title='Infer fiber'
              onClick={chooseTarget}
            >
              <IoMdColorWand
                className={isChoosingTarget ? "animate-bounce" : ""}
              />
            </button>
            <button
              className='btn btn-xs btn-square btn-ghost'
              title='New fiber'
              onClick={() =>
                addFiber(
                  [
                    {
                      id: 0,
                      type: "line",
                      startX: 0.11,
                      startY: 0.21,
                      endX: 0.31,
                      endY: 0.41,
                    },
                  ],
                  randomColor()
                )
              }
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
              prevFibers.splice(key, 1);
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
            onChange={(event) =>
              setAppState((prevAppState) => ({
                ...prevAppState,
                magnitude: event.target.value,
              }))
            }
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
