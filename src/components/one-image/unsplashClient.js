import axios from 'axios';

/**
 * Client for Unsplash API
 */
export default class UnsplashClient {
  constructor(config) {
    this.enderpointSearch = config && config.enderpointSearch ? config.enderpointSearch : 'https://api.unsplash.com';
    this.clientKey = config && config.clientKey ? config.clientKey : '';
    this.perPage = config && config.countPerPage ? config.countPerPage : 30;

    this.disabled = !config || this.enderpointSearch || this.clientKey;
  }

  /**
   * Search images
   *
   * @param {string} query Image search query term
   * @param {Function} callback Function for redering image gallery
   * @returns {void}
   */
  searchImages(query, callback) {
    axios.get(`${this.enderpointSearch}/search/photos`, {
      params: {
        client_id: this.clientKey,
        query,
        per_page: this.perPage,
      },
    })
      .then((response) => callback(this.parseResponse(response.data)))
      .catch(() => callback([]));
  }

  /**
   * Parses Unsplash API response
   * @param {{results: string}} results Array of images from Unsplash
   */
  parseResponse({ results }) {
    return results.map((image) => this.buildImageObject(image));
  }

  /**
   * Builds an image object
   *
   * @param {object} image Unsplash image object
   * @returns {object} Image object
   */
  buildImageObject(image) {
    return {
      url: image.urls.full,
      thumb: image.urls.thumb,
      downloadLocation: image.links.download_location,
      author: image.user.name,
      profileLink: image.user.links.html,
    };
  }

  /**
  * Download image from Unsplash
  * Required by Unsplash API Guideline for tracking purposes
  * https://help.unsplash.com/en/articles/2511258-guideline-triggering-a-download
  *
  * @param {string} downloadLocation Image download endpoint
  * @returns {void}
  */
  downloadImage(downloadLocation) {
    axios.get(downloadLocation, {
      params: {
        client_id: this.clientKey,
      },
    }).catch((error) => console.log(error));
  }

  enabled(){
    return this.enderpointSearch && this.clientKey;
  }

}
