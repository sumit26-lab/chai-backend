class ApiResponse{
    constructor(statusCode,message="Success",data){
        this.statusCode=statusCode,
        this.message=message,
        this.data=null,
        this.success=statusCode <400
    }
}