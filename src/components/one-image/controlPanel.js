import { make, isUrl, createUnsplashImageCredits } from './helpers';
import UnsplashClient from './unsplashClient';
import DefaultClient from './defaultClient';

/**
 * Renders control panel view
 *  - Embed image from the deployed server
 *  - Embed image from Unsplash
 *  - Embed image url
 *  - Upload
 */
export default class ControlPanel {
  /**
   * @param {{api: object, config: object, readOnly: Boolean, cssClasses: object, onSelectImage: Function}}
   *  api - Editorjs API
   *  config - Tool custom config
   *  readOnly - read-only mode flag
   *  cssClasses - Css class names
   *  onSelectImage - Image selection callback
   */
  constructor({
    api, config, cssClasses, onSelectImage, readOnly,
  }) {
    this.api = api;
    this.config = config;
    this.readOnly = readOnly;

    this.cssClasses = {
      ...cssClasses,
      controlPanel: 'inline-image__control-panel',
      tabWrapper: 'inline-image__tab-wrapper',
      tab: 'inline-image__tab',
      embedButton: 'inline-image__embed-button',
      search: 'inline-image__search',
      imageGallery: 'inline-image__image-gallery',
      noResults: 'inline-image__no-results',
      imgWrapper: 'inline-image__img-wrapper',
      thumb: 'inline-image__thumb',
      active: 'active',
      hidden: 'hidden',
      scroll: 'scroll',
    };

    this.onSelectImage = onSelectImage;

    this.nodes = {
      loader: null,

      defaultTab: null,
      unsplashTab: null,
      embedUrlTab: null,
      uploadTab: null,

      defaultPanel: null,
      unsplashPanel: null,
      embedUrlPanel: null,
      uploadPanel: null,
      
      // unsplash
      imageGallery: null,
      searchInput: null,
      // deployed server
      imageGallery0: null,
      searchInput0: null,
    };

    const ctx = this;
    this.defaultClient = new DefaultClient(this.config.server, (id, uri, author, authorName) =>{
      ctx.onUploaded(ctx, id, uri, author, authorName);
    });
    this.unsplashClient = new UnsplashClient(this.config.unsplash);
    this.searchTimeout = null;
  }

  /**
   * Creates Control Panel components
   *
   * @returns {HTMLDivElement}
   */
  render() {
    const wrapper = make('div', this.cssClasses.controlPanel);
    const tabWrapper = make('div', this.cssClasses.tabWrapper);

    // const defaultEnabled = !this.defaultClient.searchDisabled;
    // const uploadEnabled = !this.defaultClient.uploadDisabled;
    // const unsplashEnabled = !this.unsplashClient.disabled;

    const defaultTab = make('div', [this.cssClasses.tab, this.cssClasses.active], {
      innerHTML: 'Default',
      onclick: () => this.showDefaultPanel(),
    });
    const unsplashTab = make('div', this.cssClasses.tab, {
      innerHTML: 'Unsplash',
      onclick: () => this.showUnsplashPanel(),
    });
    const uploadTab = make('div', [this.cssClasses.tab], {
      innerHTML: 'Upload',
      onclick: () => this.showUploadPanel(),
    });
    const embedUrlTab = make('div', [this.cssClasses.tab], {
      innerHTML: 'Embed URL',
      onclick: () => this.showEmbedUrlPanel(),
    });

    const defaultPanel = this.renderDefaultPanel();
    const unsplashPanel = this.renderUnsplashPanel();
    const uploadPanel = this.renderUploadPanel();
    const embedUrlPanel = this.renderEmbedUrlPanel();

    tabWrapper.appendChild(defaultTab);
    tabWrapper.appendChild(unsplashTab);
    tabWrapper.appendChild(uploadTab);
    if(this.config.supportEmbedUrl)
      tabWrapper.appendChild(embedUrlTab);

    wrapper.appendChild(tabWrapper);

    wrapper.appendChild(defaultPanel);
    wrapper.appendChild(unsplashPanel);
    wrapper.appendChild(uploadPanel);
    if(this.config.supportEmbedUrl)
      wrapper.appendChild(embedUrlPanel);

    this.nodes.defaultPanel = defaultPanel;
    this.nodes.unsplashPanel = unsplashPanel;
    this.nodes.uploadPanel = uploadPanel;
    this.nodes.embedUrlPanel = embedUrlPanel;

    this.nodes.defaultTab = defaultTab;
    this.nodes.unsplashTab = unsplashTab;
    this.nodes.uploadTab = uploadTab;
    this.nodes.embedUrlTab = embedUrlTab;

    return wrapper;
  }

  showTab(theTab, thePanel){
    theTab.classList.add(this.cssClasses.active);
    thePanel.classList.remove(this.cssClasses.hidden);
  }

  hideTab(theTab, thePanel){
    theTab.classList.remove(this.cssClasses.active);
    thePanel.classList.add(this.cssClasses.hidden);
  }

  /**
   * Shows "Default" control panel
   *
   * @returns {void}
   */
  showDefaultPanel() {
    this.showTab(this.nodes.defaultTab, this.nodes.defaultPanel);
    this.hideTab(this.nodes.unsplashTab, this.nodes.unsplashPanel);
    this.hideTab(this.nodes.embedUrlTab, this.nodes.embedUrlPanel);
    this.hideTab(this.nodes.uploadTab, this.nodes.uploadPanel);
  }

  /**
   * Shows "Unsplash" control panel
   *
   * @returns {void}
   */
  showUnsplashPanel() {
    this.hideTab(this.nodes.defaultTab, this.nodes.defaultPanel);
    this.showTab(this.nodes.unsplashTab, this.nodes.unsplashPanel);
    this.hideTab(this.nodes.embedUrlTab, this.nodes.embedUrlPanel);
    this.hideTab(this.nodes.uploadTab, this.nodes.uploadPanel);
  }

  /**
   * Shows "Embed Url" control panel
   *
   * @returns {void}
   */
  showEmbedUrlPanel() {
    this.hideTab(this.nodes.defaultTab, this.nodes.defaultPanel);
    this.hideTab(this.nodes.unsplashTab, this.nodes.unsplashPanel);
    this.showTab(this.nodes.embedUrlTab, this.nodes.embedUrlPanel);
    this.hideTab(this.nodes.uploadTab, this.nodes.uploadPanel);
  }

  /**
   * Shows "Embed Url" control panel
   *
   * @returns {void}
   */
  showUploadPanel() {
    this.hideTab(this.nodes.defaultTab, this.nodes.defaultPanel);
    this.hideTab(this.nodes.unsplashTab, this.nodes.unsplashPanel);
    this.hideTab(this.nodes.embedUrlTab, this.nodes.embedUrlPanel);
    this.showTab(this.nodes.uploadTab, this.nodes.uploadPanel);
  }

  /**
   * Creates "Embed Url" control panel
   *
   * @returns {HTMLDivElement}
   */
  renderEmbedUrlPanel() {
    const wrapper = make('div', this.cssClasses.hidden);

    ///////////////// Upload

    // let theFile = null;
    // const fileInput = make('div', [this.cssClasses.input, 'file'], {
    //   id: 'image-uploader',
    //   type: 'file',
    //   name: 'file',
    //   accept: '.png, .jpg, .jpeg, .gif, .webp',
    //   disabled : this.readOnly || this.defaultClient.uploadDisabled,
    // });
    // fileInput.dataset.placeholder = 'Choose a image file';
    // const uploadImageButton = make('div', [this.cssClasses.embedButton, this.cssClasses.input], {
    //   id: 'upload-button',
    //   innerHTML: 'Upload',
    //   disabled : !theFile,
    //   onclick: () => this.defaultClient.upload(theFile),
    // });

    // fileInput.onchange = function(event) {
    //   const files = fileInput.files;
    //   if(files.length > 0){
    //     theFile = files[0];
    //     uploadImageButton.disabled = false;
    //   }
    // };

    // wrapper.appendChild(fileInput);
    // wrapper.appendChild(uploadImageButton);

    //////////////// Embed

    const urlInput = make('div', [this.cssClasses.input, this.cssClasses.caption], {
      //id: 'image-url',
      contentEditable: !this.readOnly,
    });
    const embedImageButton = make('div', [this.cssClasses.embedButton, this.cssClasses.input], {
      //id: 'embed-button',
      innerHTML: 'Embed Image',
      onclick: () => this.embedButtonClicked(urlInput.innerHTML),
    });

    urlInput.dataset.placeholder = 'Enter image url...';

    wrapper.appendChild(urlInput);
    wrapper.appendChild(embedImageButton);

    return wrapper;
  }

  /**
   * OnClick handler for Embed Image Button
   *
   * @param {string} imageUrl embedded image url
   * @returns {void}
   */
  embedButtonClicked(imageUrl) {
    if (isUrl(imageUrl)) {
      this.onSelectImage({ url: imageUrl });
    } else {
      this.api.notifier.show({
        message: 'Please enter a valid url.',
        style: 'error',
      });
    }
  }

  
  /**
   * Creates "Upload" control panel
   *
   * @returns {HTMLDivElement}
   */
  renderUploadPanel() {
    const ctx = this;
    const wrapper = make('div', this.cssClasses.hidden);

    let theFile = null;
    const fileInput = make('input', [this.cssClasses.input, 'file'], {
      //id: 'image-uploader',
      type: 'file',
      name: 'file',
      accept: '.png, .jpg, .jpeg, .gif, .webp',
      disabled: this.readOnly || this.defaultClient.uploadDisabled
    });
    //fileInput.dataset.placeholder = 'Choose a image file';
    //fileInput.disabled = this.readOnly || this.defaultClient.uploadDisabled;

    const uploadImageButton = make('div', [this.cssClasses.embedButton, this.cssClasses.input], {
      //id: 'upload-button',
      innerHTML: 'Upload',
      disabled : true,
      onclick: () => {
        theFile = fileInput.files[0];
        if(!theFile){
          ctx.api.notifier.show({
            message: 'No file selected 😟',
            style: 'error',
          });
          return;
        }
        const selectedFileName = theFile.name;
        if (selectedFileName.endsWith(".png") || selectedFileName.endsWith(".jpg") || selectedFileName.endsWith(".jpeg") ||
            selectedFileName.endsWith(".gif") || selectedFileName.endsWith(".webp")) {
            if(ctx.onProgressUpdated){
              ctx.onProgressUpdated(0);
            }
            ctx.defaultClient.uploadImage(theFile);
        }
        else {
          this.api.notifier.show({
            message: 'The file is not an image.',
            style: 'error',
          });
        }
      }, // onclick
    });

    wrapper.appendChild(fileInput);
    wrapper.appendChild(uploadImageButton);

    return wrapper;
  }


  /**
   * Creates "Default" control panel
   *
   * @returns {HTMLDivElement}
   */
  renderDefaultPanel() {
    const wrapper = make('div');
    const imageGallery = make('div', this.cssClasses.imageGallery);
    const searchInput = make('div', [this.cssClasses.input, this.cssClasses.caption, this.cssClasses.search], {
      //id: 'default-search',
      contentEditable: !this.readOnly && !this.defaultClient.searchDisabled,
      oninput: () => this.searchInputHandler(),
    });

    searchInput.dataset.placeholder = 'Search for an image...';

    wrapper.appendChild(searchInput);
    wrapper.appendChild(imageGallery);

    this.nodes.searchInput0 = searchInput;
    this.nodes.imageGallery0 = imageGallery;

    return wrapper;
  }

  /**
   * Creates "Unsplash" control panel
   *
   * @returns {HTMLDivElement}
   */
  renderUnsplashPanel() {
    const wrapper = make('div', this.cssClasses.hidden);
    const imageGallery = make('div', this.cssClasses.imageGallery);
    const searchInput = make('div', [this.cssClasses.input, this.cssClasses.caption, this.cssClasses.search], {
      //id: 'unsplash-search',
      contentEditable: !this.readOnly && !this.unsplashClient.disabled,
      oninput: () => this.searchUnsplashInputHandler(),
    });

    searchInput.dataset.placeholder = 'Search for an image...';

    wrapper.appendChild(searchInput);
    wrapper.appendChild(imageGallery);

    this.nodes.searchInput = searchInput;
    this.nodes.imageGallery = imageGallery;

    return wrapper;
  }

  /**
   * OnInput handler for Search input
   *
   * @returns {void}
   */
  searchUnsplashInputHandler() {
    this.showUnsplashLoader();
    this.performUnsplashSearch();
  }

  /**
   * Shows a loader spinner on image gallery
   *
   * @returns {void}
   */
  showUnsplashLoader() {
    this.nodes.imageGallery.innerHTML = '';
    this.nodes.loader = make('div', this.cssClasses.loading);
    this.nodes.imageGallery.appendChild(this.nodes.loader);
  }

  /**
   * Performs image search on user input.
   * Defines a timeout for preventing multiple requests
   *
   * @returns {void}
   */
  performUnsplashSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const query = this.nodes.searchInput.innerHTML;
      this.unsplashClient.searchImages(query,
        (results) => this.appendImagesToUnsplashGallery(results));
    }, 1000);
  }

  /**
   * Creates the image gallery using Unsplash API results.
   *
   * @param {Array} results Images from Unsplash API
   */
  appendImagesToUnsplashGallery(results) {
    this.nodes.imageGallery.innerHTML = '';
    if (results && results.length) {
      this.nodes.unsplashPanel.classList.add(this.cssClasses.scroll);
      results.forEach((image) => {
        this.createUnsplashThumbImage(image);
      });
    } else {
      const noResults = make('div', this.cssClasses.noResults, {
        innerHTML: 'No images found',
      });
      this.nodes.imageGallery.appendChild(noResults);
      this.nodes.unsplashPanel.classList.remove(this.cssClasses.scroll);
    }
  }

  /**
   * Creates a thumb image and appends it to the image gallery
   *
   * @param {Object} image Unsplash image object
   * @returns {void}
   */
  createUnsplashThumbImage(image) {
    const imgWrapper = make('div', this.cssClasses.imgWrapper);
    const img = make('img', this.cssClasses.thumb, {
      src: image.thumb,
      onclick: () => this.downloadUnsplashImage(image),
    });

    const { appName } = this.config.unsplash;
    const imageCredits = createUnsplashImageCredits({ ...image, appName });

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(imageCredits);
    this.nodes.imageGallery.append(imgWrapper);
  }

  /**
   * Handler for embedding Unsplash images.
   * Issues a request to Unsplash API
   *
   * @param {{url: string, author: string, profileLink: string, downloadLocation: string}}
   *  url - Image url
   *  author - Unsplash image author name
   *  profileLink - Unsplash author profile link
   *  downloadLocation - Unsplash endpoint for image download
   *
   * @returns {void}
   */
  downloadUnsplashImage({
    url, author, profileLink, downloadLocation,
  }) {
    this.onSelectImage({
      url,
      info: {
        author,
        profileLink,
        provider: "unsplash"
      },
    });
    this.unsplashClient.downloadImage(downloadLocation);
  }

  onUploaded(ctx, id, uri, author, authorName){
    console.log(uri);
    console.log(author);
    ctx.onSelectImage({
      url: uri,
      info: {
        author: author,
        profileLink: "/" + authorName,
        provider: "server"
      }
    });
  }

}
