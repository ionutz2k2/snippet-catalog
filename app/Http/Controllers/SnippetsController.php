<?php

namespace App\Http\Controllers;

use App\Snippet;
use Exception;
use Illuminate\Http\Request;

use Illuminate\Contracts\Validation\Validator;

class SnippetsController extends Controller
{

    /**
     * Contains an array with all the validation rules
     * required for creating and updating the resource
     *
     * @var array
     */
    protected $validationRules = [
        'title' => 'required',
        'description' => 'required',
        'author' => 'required',
    ];

    /**
     * Contains an array with validation error messages
     * that should overwrite the default ones.
     *
     * @var array
     */
    protected $validationMessages = [
        'required' => 'Please fill in the :attribute field.',
    ];

    /**
     * Contains an array with custom attribute names to be
     * used when generating a validation error message
     *
     * @var array
     */
    protected $validationCustomAttributes = [];

    /**
     * Snippet decorator
     *
     * @var App\Decorators\DecoratorInterface
     */
    protected $decorator = null;

    public function __construct()
    {
        $decoratorName = 'App\\Decorators\\SnippetDecorator';
        if (!class_exists($decoratorName))
            return $this->respondNotFound('The decorator associated with the eloquent model Snippet does not exist!');

        $this->decorator = new $decoratorName;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $resourceList = Snippet::all();

        $resourceList = $this->decorator->decorateList($resourceList->all());

        return $this->respond([
            'data' => $resourceList
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $requestData = $this->parseRequestData($request->all());
        $validationRules = isset($this->validationRules['add']) ? $this->validationRules['add'] : $this->validationRules;
        $this->validateRequestData($request, $requestData, $validationRules, $this->validationMessages, $this->getCustomValidationAttributes($validationRules));

        try {
            $model = new Snippet($requestData);
            $model->save();
            return $this->respondCreated('Snippet was successfully created.');
        }
        catch (Exception $e) {
            return $this->respondInternalError($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $resource = Snippet::find($id);
        if(!$resource)
            return $this->respondNotFound('The requested Snippet was not found.');

        $resource = $this->decorator->decorate($resource);

        return $this->respond([
            'data' => $resource
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $requestData = $this->parseRequestData($request->all());
        $validationRules = isset($this->validationRules['edit']) ? $this->validationRules['edit'] : $this->validationRules;
        $this->validateRequestData($request, $requestData, $validationRules, $this->validationMessages, $this->getCustomValidationAttributes($validationRules));

        try {
            $resource = Snippet::find($id);
            if (!$resource) $this->respondUnprocessableEntity();
            $resource->update($requestData);
            return $this->respondWithSuccess('Snippet was successfully modified.');
        }
        catch (Exception $e) {
            return $this->respondInternalError($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $deleteArray = explode(',', $id);
        if (count($deleteArray) == 0)
            return $this->respondBadRequest('No snippet was selected to be deleted. Please select the snippets you want to delete by clicking on the checkboxes next to them');

        if (count($deleteArray) > 50)
            return $this->respondBadRequest('You are not allowed to delete more than 50 snippets at one time');

        try {
            $messages = [];
            $resourceList = Snippet::whereIn('id', $deleteArray);
            $deletedCount = $resourceList->delete();
            $messages['success'][] = $deletedCount . ' Snippet'.strtolower(($deletedCount == 1) ? '' : 's').' deleted successfully.';
            return $this->respondWithMessages($messages);
        }
        catch (Exception $e) {
            \Log::error($e->getTraceAsString());
            return $this->respondInternalError($e->getMessage());
        }
    }

    /**
     * Format the validation errors to be returned.
     *
     * @param Validator|\Illuminate\Validation\Validator $validator
     *
     * @return array
     */
    protected function formatValidationErrors(Validator $validator)
    {
        $returnErrors = [];
        foreach ($validator->errors()->getMessages() as $field => $errors) {
            $returnErrors[$field] = implode('<br />', array_filter($errors));
        }
        $returnErrors = $this->decorator->decorateArrayItem($returnErrors);

        return [
            'messages' => [
                'error' => $returnErrors
            ]
        ];
    }

    /**
     * Validate the given request with the given rules.
     * Overloaded version that uses the $requestData param to receive the request data
     * that needs validating. Useful for the cases where the received request data
     * needs to be parsed before use.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  array $requestData
     * @param  array $rules
     * @param  array $messages
     * @param  array $customAttributes
     */
    public function validateRequestData(Request $request, array $requestData, array $rules, array $messages = [], array $customAttributes = [])
    {
        $validator = $this->getValidationFactory()->make($requestData, $rules, $messages, $customAttributes);

        if ($validator->fails()) {
            $this->throwValidationException($request, $validator);
        }
    }

    /**
     * @param $requestData
     *
     * @return array
     */
    protected function parseRequestData($requestData)
    {
        $requestData = $this->decorator->revertArrayItemDecoration($requestData);
        $requestData = array_map(function($item) {
            if (is_string($item) && (strlen(trim($item)) == 0)) return null;
            return $item;
        }, $requestData);

        return $requestData;
    }

    protected function getCustomValidationAttributes($validationRules)
    {
        $customNames = [];
        foreach ($validationRules as $rule => $value)
            $customNames[$rule] = ucwords(str_replace('_', ' ', snake_case($rule)));

        return array_merge($customNames, $this->validationCustomAttributes);
    }
}
