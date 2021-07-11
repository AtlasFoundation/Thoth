import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Window from "../../common/Window/Window";

import "../spell.module.css";
import { useLayout } from "../../../contexts/Layout";

const TextEditor = (props) => {
  const [code, setCode] = useState("");
  const [data, setData] = useState("");
  const [height, setHeight] = useState();
  const { textEditorData, saveTextEditor } = useLayout();

  const bottomHeight = 50;

  const editorOptions = {
    lineNumbers: false,
    minimap: {
      enabled: false,
    },
    suggest: {
      preview: false,
    },
    wordWrap: "bounded",
    fontSize: 18,
  };

  useEffect(() => {
    setData(textEditorData);
    setCode(textEditorData.data);
  }, [textEditorData]);

  useEffect(() => {
    if (props?.node?.rect?.height)
      setHeight(props.node.rect.height - bottomHeight);

    // this is to dynamically set the appriopriate height so that Monaco editor doesnt break flexbox when resizing
    props.node.setEventListener("resize", (data) => {
      setTimeout(() => setHeight(data.rect.height - bottomHeight), 0);
    });
  }, [props.node]);

  const onSave = () => {
    saveTextEditor(data);
  };

  const updateCode = (code) => {
    setCode(code);
    setData({
      ...data,
      data: code,
    });
  };

  const toolbar = (
    <>
      <button className="small" onClick={onSave}>
        Save
      </button>
    </>
  );

  return (
    <Window toolbar={toolbar}>
      <Editor
        theme="vs-dark"
        height={height}
        defaultLanguage="plaintext"
        value={code}
        options={editorOptions}
        defaultValue={code}
        onChange={updateCode}
      />
    </Window>
  );
};

export default TextEditor;
