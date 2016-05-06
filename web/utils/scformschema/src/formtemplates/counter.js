import React from 'react';
import t from 'tcomb-form';

const counter = t.form.Form.templates.textbox.clone({
  renderInput: (locals) => {
    let increment = () => {
      locals.onChange(+locals.value + 1);
    }

    let decrement = () => {
      locals.onChange(+locals.value - 1);
    }

    let onChange = (e) => {
      locals.onChange(e.target.value);
    }
    return (
      <div>
        <div className="form-counter">
          <input className="form-control form-control-counter" value={locals.value} onChange={onChange} />
          <button className="btn btn-default btn-form-counter" type="submit" onClick={increment}>+</button>
          <button className="btn btn-default btn-form-counter" type="submit" onClick={decrement}>-</button>
        </div>
      </div>
    );
  }
})

export default counter;