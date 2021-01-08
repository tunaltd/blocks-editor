//import './index.css';
require('./index.css').toString();

class MarkdownBlock {

  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Should this tool be displayed at the Editor's Toolbox
   *
   * @returns {boolean}
   * @public
   */
  static get displayInToolbox() {
    return true;
  }


  /**
   * Allow to press Enter inside the CodeTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="208" height="128" viewBox="0 0 208 128"><rect width="198" height="118" x="5" y="5" ry="10" stroke="#000" stroke-width="10" fill="none"/><path d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z"/></svg>',
      title: 'Markdown',
    };
  }

  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    this.placeholder = this.api.i18n.t(config.placeholder || MarkdownBlock.DEFAULT_PLACEHOLDER);

    this.CSS = {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      wrapper: 'ce-markdown',
      editor: 'ce-markdown__editor',
      viewer: 'ce-markdown__viewer'
    };

    this.nodes = {
      editor: null,
      viewer: null,
    };

    this.data = {
      markdown: data.markdown || '',
    };

    //this.textarea = null;
    this.resizeDebounce = null;

    if(!MarkdownBlock.mdParser){
      MarkdownBlock.mdParser = window.markdownit ? window.markdownit() : undefined;
    }
  }

  _drawEditor(){
    const nodes = this.nodes;
    const taEditor = document.createElement('textarea');

    taEditor.classList.add(this.CSS.editor, this.CSS.input);
    taEditor.textContent = this.data.markdown;
    taEditor.placeholder = this.placeholder;
    taEditor.addEventListener('focusout', () => {
      taEditor.style.display = "none";//.visibility='hidden';

      const viewer = nodes.viewer;
      viewer.style.display = "block";//.visibility='visible';
      viewer.innerHTML = this._mdToHtml();
    });

    return taEditor;
  }

  _drawViewer(){
    const nodes = this.nodes;
    const viewer = document.createElement('div');
    viewer.classList.add(this.CSS.viewer, this.CSS.baseClass);
    viewer.innerHTML = MarkdownBlock.mdParser ? MarkdownBlock.mdParser.render(this.data.markdown) : this.data.markdown;

    if(!this.readOnly){
      // solution 1 about switch view to edit: works well, but a little dissatisfied
      // const ctx = this;
      // viewer.onmouseenter = (ev) =>{
      //   ctx.enterEditMode();
      // };
      viewer.style.display = "none";//.visibility='hidden';
    }
    
    return viewer;
  }

  _mdToHtml(){
    return MarkdownBlock.mdParser.render(this.data.markdown);
  }

  enterEditMode(){
    if(this.readOnly)
      return;
    
    this.nodes.viewer.style.display = "none";//.visibility='hidden';
    this.nodes.editor.style.display = "block";//.visibility='visible';
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement} this.nodes.holder - Markdown's wrapper
   * @public
   */
  render() {
    const wrapper = document.createElement('div');
    const renderingTime = 1000;

    wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);

    this.nodes.viewer = this._drawViewer();
    wrapper.appendChild(this.nodes.viewer);

    if (this.readOnly) {
      //this.nodes.editor.disabled = true;
    } else {
      this.nodes.editor = this._drawEditor();
      this.nodes.editor.addEventListener('input', () => {
        this.onInput();
      });
      wrapper.appendChild(this.nodes.editor);

      // visibility
      this.nodes.editor.style.display = "block";//.visibility = 'visible';
      this.nodes.viewer.style.display = "none";//.visibility = 'hidden';
    }

    setTimeout(() => {
      this.resize();
    }, renderingTime);

    return wrapper;
  }

  // solution 2 about switch view to edit
  renderSettings(){
    const settings = [
      {
        name: 'edit',
        icon: `<?xml version="1.0" encoding="utf-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" height="64" width="64" viewBox="0 0 64 64">
          <g>
            <path id="path1" transform="rotate(0,32,32) translate(14,14.002248553352) scale(1.12489459906162,1.12489459906162)  " fill="#000000" d="M4.234565,23.060143L3.3980846,26.498995 5.6062109,28.670895 9.1839902,27.854559z M20.369981,6.6974076L5.4623272,21.465012 10.698205,26.536911 25.463305,11.631243z M24.268012,2.8359963L21.791127,5.2896117 26.870864,10.210285 29.195014,7.8640078z M24.290015,0L32.002999,7.8720034 10.464999,29.613993 0,31.999001 2.5469978,21.53801z" />
          </g>
        </svg>`
      }
    ];
    const wrapper = document.createElement('div');
    const ctx = this;
    settings.forEach( tune => {
      let button = document.createElement('div');

      button.classList.add('cdx-settings-button');
      button.innerHTML = tune.icon;
      button.addEventListener('click', () => {
        // this._toggleTune(tune.name);
        // button.classList.toggle('cdx-settings-button--active');
        if(tune.name === "edit"){
          ctx.enterEditMode();
        }
      });
      wrapper.appendChild(button);
    });

    return wrapper;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} mdWrapper - Markdown's wrapper, containing textarea with Markdown
   * @returns {MarkdownData} - saved plugin Markdown
   * @public
   */
  save(mdWrapper) {
    this.data = {
      markdown: mdWrapper.querySelector('textarea').value,
    };
    return this.data;
  }

  /**
   * Textarea change event
   *
   * @returns {void}
   */
  onInput() {
    if (this.resizeDebounce) {
      clearTimeout(this.resizeDebounce);
    }

    this.resizeDebounce = setTimeout(() => {
      this.resize();
    }, 200);
  }

  /**
   * Resize textarea to fit whole height
   *
   * @returns {void}
   */
  resize() {
    if(this.nodes.editor){
      this.nodes.editor.style.height = 'auto';
      this.nodes.editor.style.height = this.nodes.editor.scrollHeight + 'px';
    }
    this.nodes.viewer.style.height = 'auto';
    this.nodes.viewer.style.height = this.nodes.viewer.scrollHeight + 'px';
  }

  // /**
  //  * onPaste callback fired from Editor`s core
  //  *
  //  * @param {PasteEvent} event - event with pasted content
  //  */
  // onPaste(event) {
  //   const content = event.detail.data;

  //   this.data = {
  //     markdown: content.textContent,
  //   };
  // }

  /**
   * Default placeholder for Markdown's textarea
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_PLACEHOLDER() {
    return 'Enter Markdown text';
  }

}

export default MarkdownBlock;