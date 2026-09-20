import './App.css';

// Renders a list of records as collapsible <details> items, where each
// item's summary line identifies the record and the expanded body lists
// the remaining fields as label/value rows.
export default function CollapsibleRows({ items, renderSummary, fields }) {
  return (
    <div className="collapsible-list">
      {items.map((item, i) => (
        <details className="collapsible-item" key={i}>
          <summary>{renderSummary(item)}</summary>
          <div className="collapsible-body">
            {fields.map((field) => (
              <div className="collapsible-field" key={field.key}>
                <div className="label">{field.label}</div>
                <div className="value">{item[field.key]}</div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
