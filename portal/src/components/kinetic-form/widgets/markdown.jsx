import { useRef } from 'react';
import { Editor, Viewer } from '@toast-ui/react-editor';
import { createRoot } from 'react-dom/client';
import clsx from 'clsx';

/**
 * Widget function that renders the MarkdownField component defined below.
 *
 * @param container DOM element into which to render the widget
 * @param field Kinetic Field object of the text field that will store the data
 *  from this Markdown editor
 * @param options Object of options to pass through to the MarkdownField component
 */

export const Markdown = (container, field, options) => {
  createRoot(container).render(<MarkdownField {...options} field={field} />);
};

// Custom component that renders a Markdown Editor and sets any changes into a
// provided Kinetic Field.
const MarkdownField = props => {
  const { className, disabled, field, ...editorProps } = props;
  const isDisabled =
    typeof disabled !== 'undefined' ? disabled : field.form().reviewMode();
  const ref = useRef();

  const handleChange = () => {
    props.field.value(ref.current.getInstance().getMarkdown());
  };
  return (
    <div
      className={clsx(className, {
        'markdown-editor': !isDisabled,
        'markdown-viewer': !!isDisabled,
      })}
    >
      {!isDisabled ? (
        <Editor
          height="auto"
          initialEditType="wysiwyg"
          // Allows you to pass props to the Editor via the options object of
          // the widget function. See the @toast-ui/react-editor Editor
          // component for valid options.
          {...editorProps}
          ref={ref}
          initialValue={props.field.value() || ''}
          onChange={handleChange}
        />
      ) : (
        <Viewer
          height="auto"
          linkAttribute={{
            target: '_blank',
            contenteditable: 'false',
            rel: 'noopener noreferrer',
          }}
          initialValue={props.field.value() || ''}
        />
      )}
    </div>
  );
};
