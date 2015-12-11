<ul class="message_container">
    <li v-repeat="message: messages" class="alert"
        v-class="message.messageType"
        v-text="message.messageText"
        v-transition="expand"
        v-on="click: messages.$remove($index)"
    ></li>
</ul>