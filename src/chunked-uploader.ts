/**
 * @fileoverview Upload manager for large file uploads
 */


import crypto from 'crypto';
import { ChunkedUploaderOptions } from './types';

const DEFAULT_OPTIONS = Object.freeze({
    parallelism : 4,
    retryInterval : 1000
})

class Chunk extends EventTarget {

    chunk  : Buffer | string | null;
    length : number;
    offset : number;
    totalSize : number;
    data : any;
    retry : number
    options : any

    constructor (
            chunk  : Buffer | string , 
            offset : number, 
            totalSize : number, 
            options : ChunkedUploaderOptions
    ) {
        super();


    }

    upload () {
        fetch(this.options.api_url, this.options).then(response => {
            if((response.status < 199 && response.status > 299)) {
                this.dispatchEvent(new CustomEvent("error", { detail: response } ))
            }
        }) 
    }
}


class ChunkedUploader extends EventTarget {

    _sessionID : string;
    _file : File | Buffer | string;
    _fileHash : crypto.Hash;
    _promise? : Promise <any>; 
    _resolve : Function;
    _reject : Function;
    _isStarted : boolean;
    _options : Required<ChunkedUploaderOptions>;
    _stream!: ReadableStream | null;
	_streamBuffer!: Array<any>;
    _partSize : number
    _size : number
    _position: number

    constructor (
        file : File | Buffer | string,
        size : number,
        options : ChunkedUploaderOptions
    ) {
        super();

        this._file = file;
        this._size = size;
        this._options = Object.assign({}, DEFAULT_OPTIONS, options) as Required<ChunkedUploaderOptions>;
        this._position = 0;
        this._isStarted = false;
        this._fileHash = crypto.createHash('sha1');

        if (this._file instanceof File) {
            this._stream = this._file.stream()
        }

    }


    start () : Promise<object> {

        this._stream?.pipeTo()
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve
            this._reject  = reject 
        })
        return this._promise
    }


    _uploadChunk(chunk : Chunk) {
        chunk.addEventListener("error", (ev) => {
            console.log(ev)
        })
    }

}
