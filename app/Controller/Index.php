<?php
namespace App\Controller;

use App\Support\DbBuilder;
use Muyu\Tool;
use ZipStream\Exception;
use ZipStream\ZipStream;

class Index
{
    private $in;
    private $out;
    private $data;
    private $builder;

    function __construct()
    {
        $this->in = $_POST['in'] ?? 'json';
        $this->out = $_POST['out'] ?? 'sql';
        $this->data = $_POST['data'] ?? '';
        $this->builder = new DbBuilder('', false);
        $this->builder->init([], false);
    }

    function index()
    {
        header('Location: db-builder/build.html');
    }

    function build()
    {
        return $this->handle($this->in, $this->out, $this->data);
    }

    function jsonToSql()
    {
        $this->handle('array', 'sql', $this->data);
    }

    function jsonToBean()
    {
        $this->handle('array', 'bean', $this->data);
    }

    private function handle(string $in, string $out, string $data)
    {
        return $this->out($out, $this->in($in, $data));
    }

    private function in(string $mode, string $data) : array
    {
        switch($mode)
        {
            case 'json' : return json_decode($data, true) ?? [];
            default     : return [];
        }
    }

    private function out(string $mode, array $data)
    {
        switch($mode)
        {
            case 'sql' : return Tool::res(200, '', $this->builder->input($data)->sql());
            case 'bean':
                $this->builder->input($data);
                $unique = uniqid();
                $dir = __DIR__ . '/../../storage/' . $unique;
                Tool::mkdir($dir);
                $this->builder->bean($_POST['package'] ?? 'main.entity', $dir);
                $file = __DIR__ . '/../../storage/' . $unique . '.zip';
                $zip = new ZipStream($file);
                $beans = array_slice(scandir($dir), 2);
                try
                {
                    foreach($beans as $bean)
                        $zip->addFileFromPath($bean, $dir . '/' . $bean);
                    Tool::toDownload(basename($file));
                    $zip->finish();
                } catch (Exception $e) {return Tool::res(500, $e->getMessage(), null ,500);}
                finally {Tool::rmdir($dir);}
        }
    }
}