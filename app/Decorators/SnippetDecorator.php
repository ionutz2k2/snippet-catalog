<?php
namespace App\Decorators;

use Illuminate\Database\Eloquent\Model;

class SnippetDecorator implements DecoratorInterface
{
    private $decorateTable = [
        'id' => 'id',
        'title' => 'snippet_name',
        'description' => 'snippet_content',
        'author' => 'snippet_written_by',
        'created_at' => 'snippet_created_at',
        'updated_at' => 'snippet_modified_at',
    ];

    /**
     * Decorates an array of Eloquent Models
     *
     * @param array $itemsList
     *
     * @return array
     */
    public function decorateList(array $itemsList)
    {
        return array_map([$this, 'decorate'], $itemsList);
    }

    /**
     * Decorates a single Eloquent Model
     *
     * @param Model $item
     *
     * @return array
     */
    public function decorate(Model $item)
    {
        $returnObject = [];
        foreach ($item->attributesToArray() as $attribute => $value)
            if (isset($this->decorateTable[$attribute]))
                $returnObject[$this->decorateTable[$attribute]] = $value;

        return $returnObject;
    }

    /**
     * Does the inverse transformation of decorating an associative array
     *
     * The $strict param determines whether the returned array will
     * contain only the elements matched in the decorateTable property or not.
     *
     * @param array $item
     * @param bool|false $strict
     *
     * @return array
     */
    public function revertArrayItemDecoration(array $item, $strict = false)
    {
        $returnObject = [];
        $flippedDecorateTable = array_flip(array_filter($this->decorateTable,
            function ($item) {
                if (is_string($item)) return true;
                return false;
            }));

        foreach ($item as $attribute => $value)
            if (isset($flippedDecorateTable[$attribute]))
                $returnObject[$flippedDecorateTable[$attribute]] = $value;
            else if (!$strict) $returnObject[$attribute] = $value;

        return $returnObject;
    }
}