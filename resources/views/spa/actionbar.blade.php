<nav id="action-bar" class="navbar navbar-inverse navbar-fixed-bottom">
    <div class="container">
        <button class="btn"
                v-repeat="button: actions"
                v-class="button.type"
                v-on="click: button.callback"
                v-text="button.label"></button>
    </div>
    <div class="blocking" v-if="isLoading"></div>
</nav>