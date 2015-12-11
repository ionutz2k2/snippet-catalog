(function() {
    String.prototype.ucwords = function() {
        return this.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
    };
})();

Vue.filter('columnate', function (value) {
    return value.replace(/_|-/g, ' ').ucwords();
});