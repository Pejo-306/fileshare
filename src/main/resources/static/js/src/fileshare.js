function expandFolder(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var folderId = buttonElement.parent().attr("fileId");
    var nestedFilesList = $(`#${getNestedFilesListId(folderId)}`);

    if (buttonElement.hasClass("folder-unopened")) {
        if (nestedFilesList.length) {
            // if the files and folders have already been retrieved, just reveal them
            nestedFilesList.show();
        } else {
            // otherwise, request all subfiles
            requestSubFiles(folderId);
        }

        buttonElement.text("-");
        buttonElement.removeClass("folder-unopened");
        buttonElement.addClass("folder-opened");
    } else if (buttonElement.hasClass("folder-opened")) {
        nestedFilesList.hide();

        buttonElement.text("+");
        buttonElement.removeClass("folder-opened");
        buttonElement.addClass("folder-unopened");
    }
}

function newFolderButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderForm =
        `<span>
            <input class="new-file-name" type="text" name="name" placeholder="New Folder"/>
            <button onclick="addFolderEvent(this)" type="button">Add</button>
            <button onclick="cancelAddFolderEvent(this)" type="button">Cancel</button>
         </span>`;

    // hide 'New Folder' button
    buttonElement.hide();
    buttonElement.after(newFolderForm);
}

function addFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var parentFolderId = parseInt(buttonElement.parent().parent().parent().parent().attr("fileId"));
    var folderName = buttonElement.parent().find("input.new-file-name").val();
    var requestUrl = "/fileshare/create-sub-folder";
    var parameters = { parentFolderId: parentFolderId, folderName: folderName };

    $.post(requestUrl, parameters, function(data) {
        if (data["success"]) {  // reload subfolders and files from the backed
            var nestedFilesList = $(`#${getNestedFilesListId(parentFolderId)}`);
            nestedFilesList.remove();
            requestSubFiles(parentFolderId);
        } else {
            alert("Error: unable to create new folders")
        }
    });
}

function cancelAddFolderEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newFolderButton = buttonElement.parent().parent().find("> .new-folder-btn");
    var newFolderFields = buttonElement.parent();

    // show "New Folder" button
    newFolderButton.show();
    // remove new folder field and buttons
    newFolderFields.remove();
}

function uploadFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var file = buttonElement.parent().find("> input.file-input").prop("files")[0];

    if (file == undefined) {
        alert("Please choose a file before attempting to upload");
    } else {
        var parentFolderId = parseInt(buttonElement.parent().parent().parent().parent().attr("fileId"));
        var requestUrl = "/fileshare/upload-file";
        var formData = new FormData();

        formData.append("file", file);
        formData.append("parentFolderId", parentFolderId)
        $.ajax({
            url: requestUrl,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                if (data["success"]) {
                    var nestedFilesList = $(`#${getNestedFilesListId(parentFolderId)}`);
                    nestedFilesList.remove();
                    requestSubFiles(parentFolderId);
                } else {
                    alert("Error: couldn't upload file")
                }
            }
        });
    }
}

function renameFileButtonEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileNameContainer = buttonElement.parent().find("> span.file-name");
    var fileName = fileNameContainer.text();
    var renameFileForm =
        `<span>
            <input class="new-file-name" type="text" name="name" placeholder="${fileName.replace('/', '')}"/>
            <button onclick="confirmRenameFileEvent(this)" type="Button">Confirm</button>
            <button onclick="cancelRenameFileEvent(this)" type="Button">Cancel</button>
         </span>`;

    duringRenameState("");
    fileNameContainer.after(renameFileForm);
    window.gCurrentlyRenamingFile = true;
}

function confirmRenameFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileContainer = buttonElement.parent().parent();
    var fileId = parseInt(fileContainer.attr("fileId"));
    var newFileName = buttonElement.parent().find("input.new-file-name").val();
    var requestUrl = "/fileshare/rename-file";
    var parameters = { fileId: fileId, newFileName: newFileName };

    $.ajax({
        url: requestUrl,
        type: "PATCH",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                if (fileContainer.attr("fileType") == "D") {
                    newFileName += "/";
                }
                fileContainer.find("> span.file-name").text(newFileName);
            } else {
                alert("Error: unable to rename file");
            }
        }
    });

    nonRenameState("");
    // remove rename file field and buttons
    buttonElement.parent().remove();
    window.gCurrentlyRenamingFile = false;
}

function cancelRenameFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);

    nonRenameState("");
    // remove rename file field and buttons
    buttonElement.parent().remove();
    window.gCurrentlyRenamingFile = false;
}

function duringRenameState(additionalSelector) {
    var placeFileButtons = $(`${additionalSelector}.file-place-btn`);
    var renameFileButtons = $(`${additionalSelector}.file-rename-btn`);
    var deleteFileButtons = $(`${additionalSelector}.file-delete-btn`);
    var moveFileButtons = $(`${additionalSelector}.file-move-btn`);
    var newFolderButtons = $(`${additionalSelector}.new-folder-btn`);
    var uploadFileButtons = $(`${additionalSelector}.upload-file-btn`);
    var downloadFileFields = $(`${additionalSelector}.file-download-fields`);

    // hide "Rename", "Delete", "Move" and "Place" buttons
    placeFileButtons.hide();
    renameFileButtons.hide();
    deleteFileButtons.hide();
    moveFileButtons.hide();
    // disable "New Folder" and "Upload File" buttons
    newFolderButtons.prop("disabled", true);
    uploadFileButtons.parent().children().prop("disabled", true);
    // hide download file fields
    downloadFileFields.hide();
}

function nonRenameState(additionalSelector) {
    var renameFileButtons = $(`${additionalSelector}.file-rename-btn`);
    var deleteFileButtons = $(`${additionalSelector}.file-delete-btn`);
    var moveFileButtons = $(`${additionalSelector}.file-move-btn`);
    var newFolderButtons = $(`${additionalSelector}.new-folder-btn`);
    var uploadFileButtons = $(`${additionalSelector}.upload-file-btn`);
    var downloadFileFields = $(`${additionalSelector}.file-download-fields`);

    // show "Rename", "Delete" and "Move" buttons
    renameFileButtons.show();
    deleteFileButtons.show();
    moveFileButtons.show();
    // enable "New Folder" and "Upload File" buttons
    newFolderButtons.prop("disabled", false);
    uploadFileButtons.parent().children().prop("disabled", false);
    // show download file fields
    downloadFileFields.show();
}

function deleteFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileName = buttonElement.parent().find("> span.file-name").text();

    if (confirm(`Are you sure you want to delete "${fileName}"`)) {
        var requestUrl = "/fileshare/delete-file";
        var parameters = { fileId: parseInt(buttonElement.parent().attr("fileId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    buttonElement.parent().remove();
                    alert(`"${fileName}" has been successfully deleted`);
                } else {
                    alert("Error: unable to delete file");
                }
            }
        });
    }
}

function moveFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = buttonElement.parent().attr("fileId");
    var cancelPlaceFileButton = `<button onclick="cancelPlaceFileEvent(this)" class="file-cancel-place-btn" type="button">Cancel</button>`;

    window.gCurrentlyMovingFile = fileId;
    duringMoveState("");
    // add a "Cancel" button to cancel move operation
    buttonElement.parent().find("> span.file-name").after(cancelPlaceFileButton);
}

function placeFileEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var newParentId = parseInt(buttonElement.parent().attr("fileId"));
    var requestUrl = "/fileshare/move-file";
    var parameters = { fileId: window.gCurrentlyMovingFile, newParentId: newParentId };

    if (confirm("Are you sure you wish to place this file here?")) {
        var movedFileContainer = $(`[fileId="${window.gCurrentlyMovingFile}"]`);

        $.ajax({
            url: requestUrl,
            type: "PATCH",
            data: parameters,
            success: function(data) {
                var nestedFilesList = $(`#${getNestedFilesListId(newParentId)}`);

                if (data["success"]) {
                    if (nestedFilesList.length) {
                        // if the nested files have already been retrieved
                        // move the moved file's container to the nested files' container
                        movedFileContainer.appendTo(nestedFilesList);
                    } else {
                        // otherwise, delete the moved file's container
                        movedFileContainer.remove();
                    }
                } else {
                    alert("Error: unable to move folder");
                }
            }
        });

        nonMoveState("");
        window.gCurrentlyMovingFile = 0;
    }
}

function cancelPlaceFileEvent(buttonDOM) {
    nonMoveState("");
    window.gCurrentlyMovingFile = 0;
}

function duringMoveState(additionalSelector) {
    var placeFileButtons = $(`:not([fileId=${window.gCurrentlyMovingFile}])`).find("> .file-place-btn");
    var moveFileButtons = $(`${additionalSelector}.file-move-btn`);
    var renameFileButtons = $(`${additionalSelector}.file-rename-btn`);
    var deleteFileButtons = $(`${additionalSelector}.file-delete-btn`);
    var newFolderButtons = $(`${additionalSelector}.new-folder-btn`);
    var uploadFileButtons = $(`${additionalSelector}.upload-file-btn`);
    var downloadFileFields = $(`${additionalSelector}.file-download-fields`);

    // show "Place" buttons
    placeFileButtons.show();
    // hide "Move", "Delete" and "Rename" buttons
    moveFileButtons.hide();
    renameFileButtons.hide();
    deleteFileButtons.hide();
    // disable "New Folder" and "Upload File" buttons
    newFolderButtons.prop("disabled", true);
    uploadFileButtons.parent().children().prop("disabled", true);
    // hide download file fields
    downloadFileFields.hide();
}

function nonMoveState(additionalSelector) {
    var placeFileButtons = $(`${additionalSelector}.file-place-btn`);
    var moveFileButtons = $(`${additionalSelector}.file-move-btn`);
    var renameFileButtons = $(`${additionalSelector}.file-rename-btn`);
    var deleteFileButtons = $(`${additionalSelector}.file-delete-btn`);
    var newFolderButtons = $(`${additionalSelector}.new-folder-btn`);
    var uploadFileButtons = $(`${additionalSelector}.upload-file-btn`);
    var cancelPlaceFileButton = $(".file-cancel-place-btn");
    var downloadFileFields = $(`${additionalSelector}.file-download-fields`);

    // hide "Place" buttons
    placeFileButtons.hide();
    // show "Move", "Rename" and "Delete" buttons
    moveFileButtons.show();
    renameFileButtons.show();
    deleteFileButtons.show();
    // enable "New Folder" and "Upload File" buttons
    newFolderButtons.prop("disabled", false);
    uploadFileButtons.parent().children().prop("disabled", false);
    // Remove "Cancel" place button
    cancelPlaceFileButton.remove();
    // show download file fields
    downloadFileFields.show();
}

function getDownloadLinkEvent(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = parseInt(buttonElement.parent().attr("fileId"));
    var requestUrl = "/fileshare/get-download-link?fileId=" + fileId;

    $.get(requestUrl, function(data) {
        if (data["downloadLink"] == "INVALID_FILE_ID") {
            alert("Error: couldn't get download link.");
        } else {
            var downloadLinkFields =
                `<div class="file-download-fields">
                    <textarea rows="1" cols="100">${data["downloadLink"]}</textarea>
                    <button onclick="destroyDownloadLink(this)" type="button">Destroy Link</button>
                 </div>`;

            buttonElement.after(downloadLinkFields);
            buttonElement.remove();
        }
    });
}

function destroyDownloadLink(buttonDOM) {
    var buttonElement = $(buttonDOM);
    var fileId = parseInt(buttonElement.parent().parent().attr("fileId"));
    var requestUrl = "/fileshare/destroy-download-link";
    var parameters = { fileId: fileId };

    $.ajax({
        url: requestUrl,
        type: "DELETE",
        data: parameters,
        success: function(data) {
            if (data["success"]) {
                var getDownloadLinkButton =
                    `<button onclick="getDownloadLinkEvent(this)" class="file-download-fields" type="button">Get Download Link</button>`;

                buttonElement.parent().after(getDownloadLinkButton);
                buttonElement.parent().remove();
            } else {
                alert("Error: unable to destroy download link");
            }
        }
    });
}

function requestSubFiles(parentFolderId) {
    var requestUrl = "/fileshare/get-sub-files?parentFolderId=" + parentFolderId;

    $.get(requestUrl, function(data) {
        // add nested files list
        var parentFolder = $("#root-folder-container").find(`[fileId="${parentFolderId}"]`);
        var nestedFilesListId = getNestedFilesListId(parentFolderId);
        var folderList =
            `<ul id="${nestedFilesListId}">\n
                <li>\n
                    <button onclick="newFolderButtonEvent(this)" class="new-folder-btn" type="button">New Folder</button>\n
                </li>\n
                <li>\n
                    <form method="POST" action="/fileshare/upload-file" enctype="multipart/form-data">\n
                        <button onclick="uploadFileEvent(this)" class="upload-file-btn" type="button">Upload</button>\n
                        <input class="file-input" type="file" name="file"/>\n
                    </form>\n
                </li>\n
            </ul>`;
        parentFolder.append(folderList);

        if (!jQuery.isEmptyObject(data)) {
            // fill nested files list with file entries
            var nestedFilesList = $(`#${nestedFilesListId}`);

            data.sort(function(a, b) {
                // show directories at the top of the list, then normal files
                var aValue = a['fileType'] == "FILE" ? 0 : 1;
                var bValue = b['fileType'] == "FILE" ? 0 : 1;
                return bValue - aValue;
            });
            $.each(data, function(index, file) {
                if (file['fileType'] == "DIRECTORY") {  // insert a directory list entry
                    nestedFilesList.append(
                        `<li fileId="${file['id']}" fileType="D">
                            <button onclick="expandFolder(this)" class="folder-expand folder-unopened" type="button">+</button>
                            <span class="file-name">${file['name']}/</span>
                            <button onclick="renameFileButtonEvent(this)" class="file-rename-btn" type="button">Rename</button>
                            <button onclick="deleteFileEvent(this)" class="file-delete-btn" type="button">Delete</button>
                            <button onclick="moveFileEvent(this)" class="file-move-btn" type="button">Move</button>
                            <button onclick="placeFileEvent(this)" class="file-place-btn" type="button">Place</button>
                            <button onclick="getDownloadLinkEvent(this)" class="file-download-fields" type="button">Get Download Link</button>
                         </li>`
                    );
                } else if (file['fileType'] == "FILE") {  // insert a file list entry
                    nestedFilesList.append(
                        `<li fileId="${file['id']}" fileType="F">
                            <span class="file-name">${file['name']}</span>
                            <button onclick="renameFileButtonEvent(this)" class="file-rename-btn" type="button">Rename</button>
                            <button onclick="deleteFileEvent(this)" class="file-delete-btn" type="button">Delete</button>
                            <button onclick="moveFileEvent(this)" class="file-move-btn" type="button">Move</button>
                            <button onclick="getDownloadLinkEvent(this)" class="file-download-fields" type="button">Get Download Link</button>
                         </li>`
                    );
                }
            });
        }

        if (window.gCurrentlyMovingFile) {
            duringMoveState(`#${nestedFilesListId} `);
        } else if (window.gCurrentlyRenamingFile) {
            duringRenameState(`#${nestedFilesListId} `);
        } else {
            normalState(`#${nestedFilesListId} `);
        }
    });
}

function getNestedFilesListId(folderId) {
    return `nested-files-of-${folderId}`;
}

function normalState(additionalSelector) {
    var placeFileButtons = $(`${additionalSelector}.file-place-btn`);
    var moveFileButtons = $(`${additionalSelector}.file-move-btn`);
    var renameFileButtons = $(`${additionalSelector}.file-rename-btn`);
    var deleteFileButtons = $(`${additionalSelector}.file-delete-btn`);
    var newFolderButtons = $(`${additionalSelector}.new-folder-btn`);
    var uploadFileButtons = $(`${additionalSelector}.upload-file-btn`);
    var downloadFileFields = $(`${additionalSelector}.file-download-fields`);

    // hide "Place" buttons
    placeFileButtons.hide();
    // show "Move", "Rename" and "Delete" buttons
    moveFileButtons.show();
    renameFileButtons.show();
    deleteFileButtons.show();
    // enable "New Folder" and "Upload File" buttons
    newFolderButtons.prop("disabled", false);
    uploadFileButtons.parent().children().prop("disabled", false);
    // show download file fields
    downloadFileFields.show();
}

$(document).ready(function() {
    // global variables
    window.gCurrentlyMovingFile = 0;
    window.gCurrentlyRenamingFile = false;

    // setup CSRF for AJAX POST request
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });
});
