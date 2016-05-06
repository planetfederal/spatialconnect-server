import { Validator } from 'jsonschema';

Array.prototype.unique = function() {
  var o = {}, i, l = this.length, r = [];
  for(i=0; i<l;i+=1) o[this[i]] = this[i];
  for(i in o) r.push(o[i]);
  return r;
};

let formSchema = {
  "id": "/SCForm",
  "type": "object",
  "properties": {
    "id": {"type": "number"},
    "name": {"type": "string"},
    "fields": {
      "type": "array",
      "items": {"$ref": "/SCField"}
    }
  },
  "required": ["id", "name", "fields"]
};

let fieldSchema = {
  "id": "/SCField",
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "key": {"type": "string", "pattern": /^[a-z0-9_]*$/},
    "name": {"type": "string"},
    "is_required": {"type": "boolean"},
    "order": {"type": "number"},
    "type": {
      "type": "string",
      "oneOf": [
        {"type": "string", "pattern": /string/},
        {"type": "string", "pattern": /number/},
        {"type": "string", "pattern": /date/},
        {"type": "string", "pattern": /boolean/},
        {"type": "string", "pattern": /select/},
        {"type": "string", "pattern": /slider/},
        {"type": "string", "pattern": /counter/}
      ]
    },
    "initial_value": {"type": "string"},
    "minimum": {"type": "string"},
    "maximum": {"type": "string"},
    "exclusive_minimum": {"type": "string"},
    "exclusive_maximum": {"type": "string"},
    "is_integer": {"type": "boolean"},
    "minimum_length": {"type": "string"},
    "maximum_length": {"type": "string"},
    "pattern": {"type": "string"},
    "options": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["id", "key", "name", "order", "type"]
};


//returns array of errors
function validate(scSchema) {
  let v = new Validator();
  v.addSchema(fieldSchema, '/SCField');
  let validationResult = v.validate(scSchema, formSchema);
  let errors = validationResult.errors;
  let fields = scSchema.fields;

  //no empty keys
  if (fields.filter(f => f.key === '').length) {
    errors.push({
      name: 'All fields',
      message: 'must have a Data Name attribute.'
    })
  }
  //no empty names
  if (fields.filter(f => f.name === '').length) {
    errors.push({
      name: 'All fields',
      message: 'must have a Display Name attribute.'
    });
  }
  //no duplicate keys
  let duplicateErrors = fields
    .filter(f => f.key)
    .filter(f => fields.filter(_f => f.id !== _f.id && f.key === _f.key).length)
    .map(f => f.key)
    .unique()
    .map(key => ({ name: key, message: 'contains a duplicate Data Name attribute.'}));

  errors = errors.concat(duplicateErrors);
  return errors;
}

export default validate;