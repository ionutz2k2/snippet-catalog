module.exports = function()
{
    this.label = '';
    this.callback = null;
    this.type = null;

    this.initButton = function(label, aspect, action) {
        this.label = label;
        this.callback = action;
        this.type = {};
        for (var i = 0; i < aspect.length; i++) {
            switch (aspect[i]) {
                case 'blue':
                    this.type['btn-primary'] = true;
                    break;
                case 'red':
                    this.type['btn-danger'] = true;
                    break;
                case 'green':
                    this.type['btn-success'] = true;
                    break;
                case 'light-blue':
                    this.type['btn-info'] = true;
                    break;
                case 'orange':
                    this.type['btn-warning'] = true;
                    break;
                case 'white':
                    this.type['btn-default'] = true;
                    break;
                case 'right':
                    this.type['btn-right'] = true;
                    break;
                case 'left':
                    this.type['btn-left'] = true;
                    break;
            }
        }
    }
};