(identifier) @variable

(int_literal) @number

(float_literal) @number.float

(bool_literal) @boolean

(type_declaration
  (identifier) @type
)

(type_declaration) @type

(function_declaration
  (identifier) @function
)

(parameter
  (variable_identifier_declaration
    (identifier) @variable.parameter
  )
)

(struct_declaration
  (identifier) @type
)

(struct_declaration
  (struct_member
    (variable_identifier_declaration
      (identifier) @variable.member
    )
  )
)

(value_constructor) @type

[
  "const"
  "discard"
  "enable"
  "fallthrough"
  "let"
  "type"
  "var"
  "override"
  (texel_format)
] @keyword

"struct" @keyword.type

[
  "private"
  "storage"
  "uniform"
  "workgroup"
] @keyword.modifier

[
  "read"
  "read_write"
  "write"
] @keyword.modifier

"fn" @keyword.function

"return" @keyword.return

[
  ","
  "."
  ":"
  ";"
  "->"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  "loop"
  "for"
  "while"
  "break"
  "continue"
  "continuing"
] @keyword.repeat

[
  "if"
  "else"
  "switch"
  "case"
  "default"
] @keyword.conditional

[
  "&"
  "&&"
  "/"
  "!"
  "="
  "%="
  "&="
  "*="
  "+="
  "-="
  "/="
  "^="
  "|="
  "=="
  "!="
  ">="
  ">>"
  "<="
  "<<"
  "%"
  "-"
  "+"
  "|"
  "||"
  "*"
  "~"
  "^"
  "++"
  "--"
] @operator

(attribute
  "@" @attribute
  (identifier) @attribute
)

(attribute
  "("
  (identifier) @variable
  ")"
)

[
  (line_comment)
  (block_comment)
] @comment @spell

(binary_expression
  [">" "<"] @operator
)

(type_constructor_or_function_call_expression
  (identifier) @function.call
)

"bitcast" @function.builtin

(composite_value_decomposition_expression
  "."
  (identifier) @variable.member
)

((identifier) @function.builtin
  (#any-of? @function.builtin
  "all"
  "any"
  "select"
  "arrayLength"
  "abs"
  "acos"
  "acosh"
  "asin"
  "asinh"
  "atan"
  "atanh"
  "atan2"
  "ceil"
  "clamp"
  "cos"
  "cosh"
  "countLeadingZeros"
  "countOneBits"
  "countTrailingZeros"
  "cross"
  "degrees"
  "determinant"
  "distance"
  "dot"
  "dot4U8Packed"
  "dot4I8Packed"
  "exp"
  "exp2"
  "extractBits"
  "faceForward"
  "firstLeadingBit"
  "firstTrailingBit"
  "floor"
  "fma"
  "fract"
  "frexp"
  "insertBits"
  "inverseSqrt"
  "ldexp"
  "length"
  "log"
  "log2"
  "max"
  "min"
  "mix"
  "modf"
  "normalize"
  "pow"
  "quantizeToF16"
  "radians"
  "reflect"
  "refract"
  "reverseBits"
  "round"
  "saturate"
  "sign"
  "sin"
  "sinh"
  "smoothstep"
  "sqrt"
  "step"
  "tan"
  "tanh"
  "transpose"
  "trunc"

  "dpdx"
  "dpdxCoarse"
  "dpdxFine"
  "dpdy"
  "dpdyCoarse"
  "dpdyFine"
  "fwidth"
  "fwidthCoarse"
  "fwidthFine"

  "textureDimensions"
  "textureGather"
  "textureGatherCompare"
  "textureLoad"
  "textureNumLayers"
  "textureNumLevels"
  "textureNumSamples"
  "textureSample"
  "textureSampleBias"
  "textureSampleCompare"
  "textureSampleCompareLevel"
  "textureSampleGrad"
  "textureSampleLevel"
  "textureSampleBaseClampToEdge"
  "textureStore"

  "atomicLoad"
  "atomicStore"

  "atomicAdd"
  "atomicSub"
  "atomicMax"
  "atomicMin"
  "atomicAnd"
  "atomicOr"
  "atomicXor"
  "atomicExchange"
  "atomicCompareExchangeWeak"

  "pack4x8snorm"
  "pack4x8unorm"
  "pack4xI8"
  "pack4xU8"
  "pack4xI8Clamp"
  "pack4xU8Clamp"
  "pack2x16snorm"
  "pack2x16unorm"
  "pack2x16float"

  "unpack4x8snorm"
  "unpack4x8unorm"
  "unpack4xI8"
  "unpack4xU8"
  "unpack2x16snorm"
  "unpack2x16unorm"
  "unpack2x16float"

  "storageBarrier"
  "textureBarrier"
  "workgroupBarrier"
  "workgroupUniformLoad"
))
