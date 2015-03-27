var knox = require('knox');

function S3(options) {
    this.options = options;

    this.getUrl = this.getUrl.bind(this);
    this.save = this.save.bind(this);
}

S3.defaults = {
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '',
    secure: false,
    port: "80",
    proxy: '',
    bucket: ''
};

S3.prototype.getUrl = function(file) {
    var filePath = file._id + '/' + encodeURIComponent(file.name);
    return 'http://' + this.options.endpoint + '/' +
      this.options.bucket + '/' + filePath;
};

S3.prototype.save = function(options, callback) {
    var file = options.file,
        doc = options.doc,
        fileFolder = doc._id,
        filePath = fileFolder + '/' + encodeURIComponent(doc.name);

    var client = knox.createClient({
        key: this.options.accessKeyId,
        secret: this.options.secretAccessKey,
        endpoint: this.options.endpoint,
        bucket: this.options.bucket,
	port: this.options.port,
        secure: this.options.secure,
        proxy: this.options.proxy
    });

    console.log('\n' + client + '\n');

    client.putFile(file.path, '/' + decodeURIComponent(filePath), {
        'Content-Type': file.mimetype,
        'Content-Length': file.size
    }, function (err, response) {
        if (err) {
            return callback(err);
        }
        if (response.statusCode !== 200) {
            return callback(
                'S3: There was a problem uploading or authenticating. ' + response.statusCode
            );
        }
        var url = 'http://' + client.urlBase + '/' + filePath;
        callback(null, url, doc);
    });
};

module.exports = S3;
