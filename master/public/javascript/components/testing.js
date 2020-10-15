$(() => {
  const $testingForm = $(`
  <form id="test-form" class="test-form" action="/testing" method="POST">
  <p>Testing</p>
  <div class="test-form__field-wrapper">
    <input type="text" name="text" placeholder="Enter some text here">
  </div>

  <div class="test-form__field-wrapper">
    <input type="text" name="num" placeholder="Enter a number here">
  </div>

  <div class="test-form__field-wrapper">
      <button>Submit</button>
      <a id="test-form__cancel" href="#">Cancel</a>
  </div>
</form>
  `);
  window.$testingForm = $testingForm;
});