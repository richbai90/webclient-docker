<?php

set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }

    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Redefine the 'foo' method
try {
    runkit_method_add(
        'Example',
        '__construct',
        '',
        '$this->foo = "baz!\n";',
        RUNKIT_ACC_PUBLIC
    );
} catch(Exception $e) {
    runkit_method_redefine(
        'Example',
        '__construct',
        '',
        '$this->foo = "baz!\n";',
        RUNKIT_ACC_PUBLIC
    );
}

restore_error_handler();

// output Example::foo() (after redefine)


class Example {
    public $foo = "";
    function foo() {
        return $this->foo;
    }
}

// create an Example object
$e = new Example();

echo "After: " . $e->foo();

?>