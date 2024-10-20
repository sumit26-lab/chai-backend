class ApiError extends Error{
    constructor(statusCode,
        message='someThing went Worng',
        errors=[],
        statck=""
    )
    {
        super(message)
        this.statusCode=statusCode,
        this.data=null,
        this.success=false,
        this.errors=errors
        if(stack){
            this.stack=statck

        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}