function expandFolder() {
    var folderId = $(this).parent().attr("folderId");
    var requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + folderId;

    if ($(this).hasClass("folder-unopened")) {
        var nestedFoldersListId = `nested-folders-of-${folderId}`;

        if ($(`#${nestedFoldersListId}`).length) {
            // if the nested folders have already been retrieved
            // just reveal them
            $(`#${nestedFoldersListId}`).show();
        } else {
            // otherwise, request the nested folders list from the backend
            requestSubFolders(requestUrl, folderId);
        }

        $(this).text("-");
        $(this).removeClass("folder-unopened");
        $(this).addClass("folder-opened");
    } else if ($(this).hasClass("folder-opened")) {
        $(`#nested-folders-of-${folderId}`).hide();

        $(this).text("+");
        $(this).removeClass("folder-opened");
        $(this).addClass("folder-unopened");
    }
}

function newFolderButtonEvent() {
    var newFolderForm =
        `<div>
            <input type="text" name="name" placeholder="New Folder"/>
            <button class="_add-folder-event-unattached" type="Button">Add</button>
            <button class="_cancel-add-folder-event-unattached" type="Button">Cancel</button>
         </div>`;

    // disable 'New Folder' button
    $(this).prop("disabled", true);
    $(this).hide();

    $(this).parent().append(newFolderForm);

    $("#root-folder-container").trigger("change");
}

function addFolderEvent() {
    var newFolderButton = $(this).parent().parent().find(".new-folder-btn");
    var newFolderFields = $(this).parent();
    var requestUrl = "/fileshare/create-sub-folder";
    var parentFolderId = parseInt($(this).parent().parent().parent().parent().attr("folderId"));
    var folderName = newFolderFields.find("input:first-child").val();
    var parameters = { parentFolderId: parentFolderId, folderName: folderName };

    $.post(requestUrl, parameters, function(data) {
        // reload subfolders from the backed
        if (data["success"]) {
            requestUrl = "/fileshare/get-sub-folder?parentFolderId=" + parentFolderId;
            requestSubFolders(requestUrl, parentFolderId);
        }
    });
}

function cancelAddFolderEvent() {
    var newFolderButton = $(this).parent().parent().find(".new-folder-btn");
    var newFolderFields = $(this).parent();

    // enable 'New Folder' button
    newFolderButton.prop("disabled", false);
    newFolderButton.show();

    // remove new folder field and buttons
    newFolderFields.remove();
}

function deleteFolderEvent() {
    var parentContainer = $(this).parent();
    var folderName = parentContainer.find("> span.folder-name").text();

    if (confirm(`Are you sure you want to delete folder '${folderName}'`)) {
        var requestUrl = "/fileshare/delete-folder";
        var parameters = { folderId: parseInt(parentContainer.attr("folderId")) };

        $.ajax({
            url: requestUrl,
            type: "DELETE",
            data: parameters,
            success: function(data) {
                if (data["success"]) {
                    parentContainer.remove();
                    alert(`Folder '${folderName}' has been successfully deleted`);
                }
            }
        });
    }
}

function requestSubFolders(requestUrl, parentFolderId) {
    var nestedFoldersListId = `nested-folders-of-${parentFolderId}`;

    $.get(requestUrl, function(data) {
        var parentFolder = $("#root-folder-container").find(`[folderId="${parentFolderId}"]`);

        var folderList = `<ul id="${nestedFoldersListId}">\n`;
        // add a button to create a new folder
        folderList +=
            `<li>\n
                <button class="new-folder-btn _new-folder-event-unattached" type="button">New Folder</button>\n
             </li>\n`;
        // add the list of sub folders
        Object.entries(data).forEach(([id, name]) => {
            folderList +=
                `<li folderId="${id}">\n
                    <button class="folder-expand folder-unopened _folder-expand-event-unattached" type="button">+</button>\n
                    <span class="folder-name">${name}</span><span>/</span>\n
                    <button class="_delete-folder-event-unattached" type="button">Delete</button>
                 </li>\n`;
        });
        folderList += "</ul>\n";
        $(`#${nestedFoldersListId}`).remove();
        parentFolder.append(folderList);

        $("#root-folder-container").trigger("change");
    });
}

$(document).ready(function() {
    // setup CSRF for AJAX POST request
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader(header, token);
    });

    $("#root-folder-container").change(function() {
        $("._folder-expand-event-unattached").each(function(index) {
            $(this).click(expandFolder);
            $(this).removeClass("_folder-expand-event-unattached");
        });
        $("._new-folder-event-unattached").each(function(index) {
            $(this).click(newFolderButtonEvent);
            $(this).removeClass("_new-folder-event-unattached");
        });
        $("._add-folder-event-unattached").each(function(index) {
            $(this).click(addFolderEvent);
            $(this).removeClass("_add-folder-event-unattached");
        });
        $("._cancel-add-folder-event-unattached").each(function(index) {
            $(this).click(cancelAddFolderEvent);
            $(this).removeClass("_cancel-add-folder-event-unattached");
        });
        $("._delete-folder-event-unattached").each(function(index) {
            $(this).click(deleteFolderEvent);
            $(this).removeClass("_delete-folder-event-unattached");
        });
    });
    $("#root-folder-container").trigger("change");
});
