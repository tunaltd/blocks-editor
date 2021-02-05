import axios from 'axios';

/**
 * Client for the deployed server API: search, upload
 */
export default class DefaultClient {
  constructor(config, onUploaded) {
    this.enderpointSearch = config && config.enderpointSearch ? config.enderpointSearch : '';
    this.clientKey = config && config.clientKey ? config.clientKey : '';
    this.perPage = config && config.countPerPage ? config.countPerPage : 10;

    this.enderpointUpload = config && config.enderpointUpload ? config.enderpointUpload : '';
    this.onProgressUpdated = config && config.onProgressUpdated ? config.onProgressUpdated : undefined;
    this.onUploaded = onUploaded ? onUploaded : undefined;
    this.username = config && config.user ? config.user : '';

    this.searchDisabled = !config || !this.enderpointSearch || !this.clientKey;
    this.uploadDisabled = !config || !this.enderpointUpload;
    if(!this.uploadDisabled){
      this.uploader = null;
      this.initUploader();
    }
  }

  initUploader(){
    const ctx = this;
    this.uploader = new Flow({
      target: this.enderpointUpload,
      singleFile: true,
      forceChunkSize: true,
      simultaneousUploads: 1,
      maxChunkRetries: 3,
      chunkRetryInterval: 500,
      generateUniqueIdentifier: function (file, event) {
        const nameMd5 = CryptoJS.MD5(file.name).toString(CryptoJS.enc.Hex);
        return ctx.username + "__" + nameMd5;
      }
      //query: { upload_token: 'my_token' }
    });
    const r = this.uploader;
    r.on('fileSuccess', function (file, message) {
      console.log("r.fileSuccess");
      const resultData = JSON.parse(message);
      const prefix = "/" + ctx.username + "/image/";
      const resizedUri = resultData.uri.replace(prefix, prefix + "1600x900/");
      ctx.onUploaded(resultData.id, resizedUri, ctx.username, ctx.username);
    });
    r.on('fileProgress', function (file, chunk) {
      console.log('r.fileProgress');
      let bytesLoaded = 0;
      _.forEach(file.chunks, c => {
          bytesLoaded += c.progress() * 1.0 * (c.endByte - c.startByte);
      });
      const fp = bytesLoaded / file.size;
      console.log(fp);
      if(ctx.onProgressUpdated){
        const progress = fp * 100;
        ctx.onProgressUpdated(progress);
      }
    });
  }

  uploadImage(file){
    this.uploader.addFile(file);
    this.uploader.upload();
  }

  /**
   * Search images
   *
   * @param {string} query Image search query term
   * @param {Function} callback Function for redering image gallery
   * @returns {void}
   */
  searchImages(query, callback) {
    axios.get(this.enderpointSearch, {
      params: {
        clientKey: this.clientKey,
        q: query,
        //per_page: this.perPage,
      },
    })
      .then((response) => callback(response.data)) // this.parseResponse(response.data)
      .catch(() => callback([]));
  }

}
