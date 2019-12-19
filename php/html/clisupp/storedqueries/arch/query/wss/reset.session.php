<?php
/**
* The current session is stored and updated on the backend every time a stored query is invoked, just as it is on 
* the frontend. Because the framework of Arch relies on a user switching between a customer and an analyst session
* it may happen that the session the backend will store is an analyst session. We therefore need a way of switching
* the context back to a customer session so that existing security checks do not fail. That is what this query
* is for.
**/
throwSuccess();