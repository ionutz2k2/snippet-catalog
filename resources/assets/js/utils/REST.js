module.exports = function(vueInstance, resourcePath, csrf)
{
    function prepareData(data) {
        for (var i in data)
            if (typeof data[i] == 'boolean') data[i] = data[i] ? 1 : 0;
        if (csrf) {
            if (data instanceof FormData) data.append('_token', csrf)
            else data._token = csrf;
        }

        return data;
    }

    function call(params, successCallback, errorCallback) {
        $.ajax(params)
            .done(successCallback)
            .fail(errorCallback);
    }

    /**
     * Fetches the all items
     *
     * @param successCallback
     * @param errorCallback
     */
    this.getAll = function(successCallback, errorCallback) {
        var params = {
            method: 'GET',
            url: resourcePath
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Gets all the details for a specific item identified by id
     *
     * @param id
     * @param successCallback
     * @param errorCallback
     */
    this.details = function(id, successCallback, errorCallback) {
        var params = {
            method: 'GET',
            url: resourcePath + '/' + id
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Creates a new item based on the object received in the data param
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     * @param options
     */
    this.create = function(data, successCallback, errorCallback, options) {
        var params = {
            method: 'POST',
            url: resourcePath,
            data: prepareData(data),
        };
        jQuery.extend(params, options);
        call(params, successCallback, errorCallback);
    };

    /**
     * Saves the changes of an edited item received as an object in the data param
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     */
    this.update = function(data, successCallback, errorCallback) {
        var params = {
            method: 'PUT',
            url: resourcePath + '/' + data.id,
            data: prepareData(data),
        };
        call(params, successCallback, errorCallback);
    };

    /**
     * Deletes one ore more items sent as an object in the data parameter
     * The ids are concatenated in the ids member of the data object
     *
     * @param data
     * @param successCallback
     * @param errorCallback
     */
    this.delete = function(data, successCallback, errorCallback) {
        var params = {
            method: 'DELETE',
            url: resourcePath + '/' + data,
            headers: {
                'X-CSRF-TOKEN': csrf
            },
        };
        call(params, successCallback, errorCallback);
    };
};