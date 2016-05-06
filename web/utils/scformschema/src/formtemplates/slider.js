import React from 'react';
import t from 'tcomb-form';

const counter = t.form.Form.templates.textbox.clone({
  renderInput: (locals) => {
    let onChange = (e) => {
      locals.onChange(Math.round(e.target.value * 100) / 100);
    }
    return (
      <div>
        <p>{locals.value}</p>
        <input
          defaultValue={locals.value}
          value={locals.value}
          type="range"
          min={locals.config.minimum}
          max={locals.config.maximum}
          onChange={onChange}
        />
      </div>
    );
  }
})

export default counter;