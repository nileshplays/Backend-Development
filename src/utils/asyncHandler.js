// USING  P R O M I S E S
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))
    }
}
export {asyncHandler}

/*  USING T R Y CATCH
// const asyncHandler = () => {}
// const asyncHandler = (funct) => { () => {} }
// const asyncHandler = (funct) => async()=> {}
const asyncHandler = (fn) => async( req, res, next) => {
    try{
        await fn(req, res, next)
    }
    catch(err){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export {asyncHandler}
*/