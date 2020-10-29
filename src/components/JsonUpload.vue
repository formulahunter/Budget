<template>
  <div id="json-upload">
    <form>
      <label>
        <span>File contents:</span>
        <textarea id="json-content" name="content" v-model="content"></textarea>
      </label>
      <label>
        <span>Choose a file (or drop in text box above)</span>
        <input id="json-file" ref="input" type="file" accept="text/json" @change="readFile"/>
      </label>
      <input type="submit" value="Upload" @click.stop.prevent="uploadFile">
    </form>
  </div>
</template>

<script>

  /*
    update textarea contents on file change
      - indicate any errors in file format/syntax
    raise import event on submit/confirm
      - parse json, pass to BudgetApp, reconcile with existing, update server data
        - expect no conflicts
      - compile import results for each data type:
        - possible matches
          - all new records
          - most recent existing record
        - exact matches
          - all new records
          - all existing records
   */

  export default {
    name: 'JsonUpload',
    data() {
      return {
        content: ''
      }
    },
    methods: {
      async readFile(ev) {
        console.info('reading json file');
        try {
          const file = this.$refs.input.files[0];
          this.content = file ? await file.text() : '';
        }
        catch(er) {
          console.debug(er);
          console.trace();
          console.warn('error reading file contents');
        }
        return false;
      },
      async uploadFile(ev) {
        try {
          let json = JSON.parse(this.content);
          if(json) {
            this.$emit('upload', json);
          }
        }
        catch(er) {
          console.debug(er);
          console.trace();
          console.error('error submitting json data');
        }
        return false;
      }
    },
    emits: ['upload']
  }

</script>
