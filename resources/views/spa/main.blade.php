@extends('app')

@section('content')
    @include('spa.navigation')
    @include('spa.messages')
    <input type="hidden" name="_token" value="{{ csrf_token() }}" v-model="state.token" />
    <router-view></router-view>
    @include('spa.actionbar')
    <div class="blocking" v-if="isLoading"></div>
    <loading-view v-if="isLoading"></loading-view>
@stop