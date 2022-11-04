import { useDebouncedValue } from "@mantine/hooks";
import randomColor from "randomcolor";
import { ChangeEvent, useContext, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { IoMdColorWand } from "react-icons/io";
import {
  VictoryAxis,
  VictoryChart,
  VictoryHistogram,
  VictoryLegend,
} from "victory";
import { average } from "../utils";
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
    appState: { scaleLength, isChoosingTarget, imagePath, magnitude },
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

  const [showIntro, setShowIntro] = useState(true);

  const diameters = fibers.map((fiber) => fiber.average);
  const globalAverage = Math.trunc(average(diameters) * 1000) / 1000 || 0;

  const [debouncedDiameters] = useDebouncedValue(diameters, 200);
  const histogramData = debouncedDiameters.map((d) => ({ x: d }));

  return (
    <div
      id='side-panel'
      className='flex flex-col justify-between w-1/4 text-sm min-w-max bg-slate-300'
    >
      <Section
        className='h-full overflow-auto'
        id='fibers'
        title='Fibers'
        actions={
          imagePath !== "" && (
            <div>
              {showIntro ? <a className='primary'>Click there ☞</a> : <></>}
              <button
                className='btn btn-xs btn-square btn-ghost'
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
          )
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
      <Section
        className='min-h-max overflow-none'
        id='histogram'
        title='Histogram'
      >
        <div className='h-[25vh] pl-3 -mr-6'>
          <VictoryChart domainPadding={{ x: 15 }}>
            
            {debouncedDiameters.length < 2 && (
              <VictoryLegend
                x={90}
                y={130}
                title={"Add more fibers to begin plotting"}
                centerTitle
                style={{ title: { fontSize: 20 } }}
                data={[]}
              />
            )}
            
            <VictoryAxis label={magnitude} />
            <VictoryAxis
              label='# of fibers'
              dependentAxis
              style={{ axisLabel: { padding: "35" } }}
            />

            <VictoryHistogram
              style={{ data: { fill: "#5d7ca2", stroke: "#334155" } }}
              data={histogramData}
              animate={{
                duration: 500,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </div>
      </Section>
      <Section className='min-h-max overflow-none' id='globals' title='Globals'>
        <GlobalItem>
          <label htmlFor='global-average'>Average diameter:</label>
          <p id='global-average'>{`${globalAverage} ${magnitude}`}</p>
        </GlobalItem>
        <GlobalItem>
          <label htmlFor='scale-length'>Scale length: </label>
          <input
            id='scale-length'
            type='number'
            className={
              "input input-xs input-ghost w-20 m-1 rounded-sm " +
              `${props.isValidScale || "input-error"}`
            }
            onChange={props.onScaleChange}
            defaultValue={scaleLength}
          />
          <select
            id='magnitude'
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
        </GlobalItem>
      </Section>
    </div>
  );
};

const GlobalItem = (props: React.ComponentPropsWithoutRef<"div">) => {
  return <Item className='h-7'>{props.children}</Item>;
};

export default SidePanel;
