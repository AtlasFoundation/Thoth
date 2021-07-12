import { SimpleAccordion } from "../../../../common/Accordion";
import { usePubSub } from "../../../../../contexts/PubSub";
import { useLayout } from "../../../../../contexts/Layout";
import OutputGenerator from "./OutputGenerator";

const StubComponent = (props) => <div>{props.name}</div>;

const LongText = ({ initialValue, name, nodeId }) => {
  const { events, publish } = usePubSub();
  const { createOrFocus, componentTypes } = useLayout();

  const onClick = () => {
    const data = {
      data: initialValue,
      nodeId,
      key: name,
      name,
    };
    publish(events.TEXT_EDITOR_SET, data);
    createOrFocus(componentTypes.TEXT_EDITOR, "Text Editor");
  };

  return <button onClick={onClick}>Open in text editor</button>;
};

const controlMap = {
  outputGenerator: OutputGenerator,
  longText: LongText,
  input: StubComponent,
  slider: StubComponent,
  dial: StubComponent,
};

const DataControls = ({
  dataControls,
  updateData,
  width,
  data,
  nodeId,
  ...props
}) => {
  if (!dataControls) return <p>Select a component.</p>;

  return (
    <>
      {Object.entries(dataControls).map(([key, value]) => {
        // Default props to pass through to every data control
        const controlProps = {
          nodeId,
          width,
          data: value?.data,
          name: key,
          initialValue: data[key] || "",
          updateData,
        };

        const Component = controlMap[value.component] || StubComponent;

        return (
          <SimpleAccordion heading={key} key={key}>
            <Component {...controlProps} />
          </SimpleAccordion>
        );
      })}
    </>
  );
};

export default DataControls;