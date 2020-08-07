// @flow

import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import HopThoai from './DialogView'
import DialogLoading from './DialogLoading'

const DESTROY_TIMEOUT = 1;
var STATUS = {
    POPUP_STATUS: false,
}

class DialogManager {

    constructor() {
        this.dialogs = [];
    }


    static get STATUSLOADING() {
        return this._STATUSLOADING;
    }

    static set STATUSLOADING(value) {
        this._STATUSLOADING = value;
    }

    get currentDialog() {
        return this.dialogs[this.dialogs.length - 1];
    }



    add(props, callback) {
        const dialog = new RootSiblings(
            <HopThoai {...props} />,
            callback,
        );
        this.dialogs.push(dialog);
    }

    destroy() {
        STATUS.POPUP_STATUS = false;
        const dialog = this.dialogs.pop();
        setTimeout(() => {
            if (dialog)
                dialog.destroy();
        }, DESTROY_TIMEOUT);
    }


    show = (props, callback) => {
        if (!STATUS.POPUP_STATUS) {
            STATUS.POPUP_STATUS = true;
            this.add({
                ...props,
                show: true,
            }, callback);
        }
    }

    dismissAll = (callback) => {
        this.dialogs.forEach(() => {
            this.dismiss(callback);
        });
    }

    dismiss = () => {
        this.destroy()
    }

    showPopupTwoButton(txtContent, title = "", callback, dismissOnTouchOutside, label1, label2) {
        console.log("showPopupTwoButton callback ", callback);
        this.show(
            {
                title: title,
                one: false,
                content: txtContent,
                callback: callback,
                dismiss: this.dismiss,
                dismissOnTouchOutside: dismissOnTouchOutside,
                label1, label2
            }, () => {

            });
    }



    showPopupOneButton(txtContent, title = "", callback, dismissOnTouchOutside, label1, label2) {
        console.log("showPopupOneButton callback ", callback);
        this.show({
            title: title,
            one: true,
            content: txtContent,
            callback: callback,
            dismiss: this.dismiss,
            dismissOnTouchOutside: dismissOnTouchOutside,
            label1, label2
        }, () => {

        });
    }

    showLoading() {
        this.hiddenLoading()
        DialogManager.STATUSLOADING = true;
        this.dialogLoading = new RootSiblings(
            <DialogLoading></DialogLoading>);
    }
    hiddenLoading() {
        if (this.dialogLoading) {
            this.dialogLoading.destroy();
        }
    }
}

DialogManager.STATUSLOADING = false;

const dialogManager = new DialogManager();

export default dialogManager;

