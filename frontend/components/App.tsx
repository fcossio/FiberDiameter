import SystemMenu from "./SystemMenu";
import FiberItem, { Props as FiberItemProps } from "./FiberItem";
import Section from "./Section";
import Editor from "./Editor";

const App = () => {
  let fibers: FiberItemProps[] = [
    {
      id: 1,
      color: "94DC38",
      diameter: 13.254,
    },
    {
      id: 2,
      color: "DC38B8",
      diameter: 14.432,
    },
  ];

  return (
    <div className='container'>
      <SystemMenu className="w-full"/>
      <div className="flex h-[90vh]">
        
      <div id='side-panel' className='w-1/4 bg-slate-400'>
        <Section id='fibers' title='Fibers'>
          {fibers.map((fiber) => (
            <FiberItem key={fiber.id} {...fiber} />
            ))}
        </Section>
        <Section id='globals' title='Globals'></Section>
      </div>
        <div id='editor' className='w-full bg-green-700'>
          <Editor/>
      </div>
            </div>
    </div>
  );
};

export default App;
