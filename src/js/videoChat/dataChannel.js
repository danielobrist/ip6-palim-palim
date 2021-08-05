export default class DataChannel {
    constructor(rtcDataChannel) {
        this.rtcDataChannel = rtcDataChannel;

        this.rtcDataChannel.onerror = this.handleDataChannelError;
    }

    handleDataChannelError(error) {
        console.log("Data Channel Error:", error);
    }

    //TODO other general handlers and then make new class XDataChannel YDataChannel extends DataChannel super() plus special handlemessage received handlers;
}
