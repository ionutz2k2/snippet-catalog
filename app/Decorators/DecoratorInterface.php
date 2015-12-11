<?php
namespace App\Decorators;

use Illuminate\Database\Eloquent\Model;

interface DecoratorInterface
{
    public function decorateList(array $itemsList);

    public function decorate(Model $item);
}