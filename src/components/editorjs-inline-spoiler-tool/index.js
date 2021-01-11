import './index.css';

class TextSpoiler {
  constructor({ api }) {
    this.api = api;
    this.button = null;
    this.tag = 'TEXT_SPOILER';

    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };
  }

  // Make it inline
  static get isInline() {
    return true;
  }

  static get classCSS() {
    return 'text-spoiler';
  }


  static get sanitize() {
    return {
      TEXT_SPOILER: {
        class: TextSpoiler.classCSS
      }
    };
  }
  
  get icon() {
    return '<svg width="20" length="18 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 490.034 490.034" style="enable-background:new 0 0 490.034 490.034;" xml:space="preserve"><g><path d="M435.667,54.311c-7-7.1-18.4-7-25.5,0l-64,64c-79.3-36-163.9-27.2-244.6,25.5c-60.1,39.2-96.6,88.5-98.1,90.6 c-4.8,6.6-4.6,15.6,0.5,22c34.2,42,70,74.7,106.6,97.5l-56.3,56.3c-7,7-7,18.4,0,25.5c3.5,3.5,8.1,5.3,12.7,5.3s9.2-1.8,12.7-5.3 l356-355.9C442.667,72.811,442.667,61.411,435.667,54.311z M200.467,264.011c-2.6-5.9-3.9-12.3-3.9-19c0-12.9,5-25.1,14.2-34.3 c14.4-14.4,35.7-17.8,53.3-10.3L200.467,264.011z M290.667,173.911c-32.7-21-76.8-17.2-105.3,11.3c-16,16-24.7,37.2-24.7,59.7 c0,16.4,4.7,32.1,13.4,45.6l-37.1,37.1c-32.5-18.8-64.5-46.6-95.6-82.9c13.3-15.6,41.4-45.7,79.9-70.8 c66.6-43.4,132.9-52.8,197.5-28.1L290.667,173.911z"/></g></g><g><g><path d="M486.067,233.611c-24.7-30.4-50.3-56-76.3-76.3c-7.9-6.1-19.2-4.7-25.4,3.1c-6.1,7.8-4.7,19.1,3.1,25.3 c20.6,16.1,41.2,36.1,61.2,59.5c-11.8,13.8-34.8,38.6-66,61.3c-60.1,43.7-120.8,59.5-180.3,46.9c-9.7-2.1-19.3,4.2-21.3,13.9 c-2.1,9.7,4.2,19.3,13.9,21.3c15.5,3.3,31.1,4.9,46.8,4.9c23.6,0,47.4-3.7,71.1-11.1c31.1-9.7,62-25.7,91.9-47.5 c50.4-36.9,80.5-77.6,81.8-79.3C491.367,249.011,491.167,240.011,486.067,233.611z"/></g></svg>';
  }
  

  checkState() {
    const spoilerTag = this.api.selection.findParentTag(this.tag, TextSpoiler.classCSS);

    this.button.classList.toggle(this.iconClasses.active, !!spoilerTag);
  }

  // What should we do when text selected by user
  surround(range) {
    if (!range) return;

    let surroundedRange = this.api.selection.findParentTag(this.tag, TextSpoiler.classCSS);

    if (surroundedRange) {
      this.unspoiledIt(surroundedRange);
    } else {
      this.spoiledIt(range);
    }

  }

  spoiledIt(range) {
    // Create element
    const spoiler = document.createElement(this.tag);
    // Add CSS class
    spoiler.classList.add(TextSpoiler.classCSS);

    spoiler.appendChild(range.extractContents());
    range.insertNode(spoiler);

    this.api.selection.expandToTag(spoiler);
  }

  unspoiledIt(surroundedRange) {
    this.api.selection.expandToTag(surroundedRange);

    let selectedText = window.getSelection();
    let selectedRange = selectedText.getRangeAt(0);

    let unspoiledContent = selectedRange.extractContents();

    surroundedRange.parentNode.removeChild(surroundedRange);

    selectedRange.insertNode(unspoiledContent);

    selectedText.removeAllRanges();
    selectedText.addRange(selectedRange);
  }



  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.icon;

    return this.button;
  }
}

export default TextSpoiler;