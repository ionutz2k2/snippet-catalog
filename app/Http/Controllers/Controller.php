<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * HTTP status code to be send as response
     *
     * @var int
     */
    protected $statusCode = 200;

    /**
     * Generic respond function
     *
     * @param $data
     * @param array $headers
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respond($data, $headers = [])
    {
        return response()->json($data, $this->statusCode, $headers);
    }

    /**
     * Return a messages object containing all messages and message types to be sent as a response
     * The first parameter can directly be a messages object containing all messages and message
     * types to be sent as a response
     *
     * @param null $success
     * @param null $error
     * @param null $warning
     * @param null $info
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondWithMessages($success = null, $error = null, $warning = null, $info = null)
    {
        $messages = [];

        if ($success && is_array($success) && (count(array_diff(array_keys($success), ['success', 'error', 'warning', 'info'])) == 0)) {
            return $this->respond([
                'messages' => $success
            ]);
        }

        if ($success) {
            if (!is_array($success)) $success = [$success];
            $messages['success'] = $success;
        }
        if ($error) {
            if (!is_array($error)) $error = [$error];
            $messages['error'] = $error;
        }
        if ($warning) {
            if (!is_array($warning)) $warning = [$warning];
            $messages['warning'] = $warning;
        }
        if ($info) {
            if (!is_array($info)) $info = [$info];
            $messages['info'] = $info;
        }

        return $this->respond([
            'messages' => $messages
        ]);

    }

    /**
     * Return a success message
     *
     * @param $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondWithSuccess($message)
    {
        return $this->respondWithMessages($message);
    }

    /**
     * Return a Created response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondCreated($message = 'Resource was successfully created!')
    {
        $this->statusCode = 201;

        return $this->respondWithSuccess($message);
    }

    /**
     * Return an error message
     *
     * @param $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondWithError($message)
    {
        return $this->respondWithMessages(null, $message);
    }

    /**
     * Return a Bad Request response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondBadRequest($message = 'Invalid request data!')
    {
        $this->statusCode = 400;

        return $this->respondWithError($message);
    }

    /**
     * Return an Unauthorized response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondUnauthorized($message = 'Permission denied!')
    {
        $this->statusCode = 401;

        return $this->respondWithError($message);
    }

    /**
     * Return a Not Found response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondNotFound($message = 'Resource not found!')
    {
        $this->statusCode = 404;

        return $this->respondWithError($message);
    }

    /**
     * Return a Not Found response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondUnprocessableEntity($message = 'Invalid request data!')
    {
        $this->statusCode = 422;

        return $this->respondWithError($message);
    }

    /**
     * Return an Internal Server Error response with a custom message
     *
     * @param string $message
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function respondInternalError($message = 'Internal serve error!')
    {
        $this->statusCode = 500;

        return $this->respondWithError($message);
    }
}
