/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
const PREC = {
  OR: 1,
  AND: 2,
  BIT_OR: 3,
  BIT_XOR: 4,
  BIT_AND: 5,
  EQ: 6,
  CMP: 7,
  SHIFT: 8,
  ADD: 9,
  MUL: 10,
  UNARY: 11
}

export default grammar({
  name: "wgsl",

  word: $ => $.identifier,

  extras: $ => [
    $.line_comment,
    $.block_comment,
    // https://github.com/tree-sitter/tree-sitter-javascript/blob/2c5b138ea488259dbf11a34595042eb261965259/grammar.js#L11
    /[\s\uFEFF\u2060\u200B\u00A0]/
  ],

  externals: $ => [
    $.block_comment,
  ],

  rules: {
    source_file: $ => seq(repeat($.enable_directive), repeat($._declaration)),

    line_comment: _ => token(seq('//', /.*/)),

    _declaration: $ => choice(
      ";",
      seq($.global_variable_declaration, ";"),
      seq($.global_constant_declaration, ";"),
      seq($.type_alias_declaration, ";"),
      $.struct_declaration,
      $.function_declaration,
    ),

    global_variable_declaration: $ => seq(
      repeat($.attribute), $.variable_declaration, optional(seq("=", $._expression))
    ),

    global_constant_declaration: $ => choice(
      seq("const", optional(choice($.identifier, $.variable_identifier_declaration)), "=", $._expression),
      seq(repeat($.attribute), "override", choice($.identifier, $.variable_identifier_declaration), optional(seq("=", $._expression)))
    ),

    type_alias_declaration: $ => seq(
      "type", $.identifier, "=", $.type_declaration
    ),

    function_declaration: $ => seq(
      repeat($.attribute),
      "fn",
      field("name", $.identifier),
      "(",
      field("parameters", optional($.parameter_list)),
      ")",
      field("type", optional($.function_return_type_declaration)),
      field("body", $.compound_statement)
    ),

    function_return_type_declaration: $ => seq(
      "->",
      repeat($.attribute),
      $.type_declaration,
    ),

    struct_declaration: $ => seq(
      "struct",
      field("name", $.identifier),
      "{",
      seq(repeat(seq($.struct_member, ",")), $.struct_member, optional(",")),
      "}"
    ),

    struct_member: $ => seq(
      repeat($.attribute),
      $.variable_identifier_declaration,
    ),

    enable_directive: $ => seq("enable", $.identifier, ";"),

    attribute: $ => seq(
      "@",
      $.identifier,
      optional(
        seq(
          "(",
          repeat(seq($._literal_or_identifier, ",")),
          $._literal_or_identifier,
          optional(","),
          ")"
        )
      )
    ),

    _literal_or_identifier: $ => choice(
      $.float_literal,
      $.int_literal,
      $.identifier,
    ),

    identifier: _ => /([a-zA-Z_][0-9a-zA-Z][0-9a-zA-Z_]*)|([a-zA-Z][0-9a-zA-Z_]*)/,

    parameter_list: $ => seq(
      repeat(
        seq($.parameter, ",")
      ),
      $.parameter,
      optional(",")
    ),

    parameter: $ => seq(
      repeat($.attribute),
      $.variable_identifier_declaration
    ),

    _statement: $ => choice(
      $.compound_statement,
      seq($.assignment_statement, ";"),
      $.if_statement,
      $.switch_statement,
      $.loop_statement,
      $.for_statement,
      $.while_statement,
      $.break_statement,
      $.continue_statement,
      $.discard_statement,
      seq($.return_statement, ";"),
      seq($.variable_statement, ";"),
      $.increment_statement,
      $.decrement_statement
    ),

    compound_statement: $ => seq("{", repeat($._statement), "}"),

    assignment_statement: $ => choice(
      seq(
        field("left", $.lhs_expression),
        choice("=", $.compound_assignment_operator),
        field("right", $._expression),
      ),
      seq(field("left", "_"), "=", field("right", $._expression))
    ),

    compound_assignment_operator: _ => choice(...["+", "-", "*", "/", "%", "&", "|", "^"].map(op => `${op}=`)),

    if_statement: $ => seq(
      "if",
      field("condition", $._expression),
      field("consequence", $.compound_statement),
      optional(seq("else", field("alternative", $.else_statement)))
    ),

    else_statement: $ => choice(
      $.compound_statement,
      $.if_statement
    ),

    switch_statement: $ => seq(
      "switch",
      $._expression,
      "{",
      repeat1($.switch_body),
      "}"
    ),

    switch_body: $ => choice(
      seq("case", $.case_selectors, optional(":"), $.case_compound_statement),
      seq("default", optional(":"), $.case_compound_statement)
    ),

    _case_label: $ => choice(
      $.const_literal,
      $.identifier,
    ),

    case_selectors: $ => seq(
      $._case_label,
      repeat(seq(",", $._case_label)),
      optional(seq(",", "default"))
    ),

    case_compound_statement: $ => seq(
      "{", repeat($._statement), optional($.fallthrough_statement), "}"
    ),

    fallthrough_statement: _ => seq("fallthrough", ";"),

    loop_statement: $ => seq(
      "loop", "{", repeat($._statement), optional($.continuing_statement), "}"
    ),

    for_statement: $ => seq(
      "for", "(", $.for_header, ")", $.compound_statement
    ),

    for_header: $ => seq(
      optional(
        choice(
          $.variable_statement,
          $.assignment_statement,
          $.type_constructor_or_function_call_expression,
          $.increment_statement,
          $.decrement_statement
        )
      ),
      ";",
      optional($._expression),
      ";",
      optional(
        choice(
          $.increment_statement,
          $.decrement_statement,
          $.assignment_statement,
          $.type_constructor_or_function_call_expression
        )
      )
    ),

    while_statement: $ => seq(
      "while", field("condition", $._expression), $.compound_statement
    ),

    break_statement: _ => seq("break", ";"),

    break_if_statement: $ => seq("break", "if", $._expression, ";"),

    continue_statement: _ => seq("continue", ";"),

    continuing_statement: $ => seq("continuing", $.continuing_compound_statement),

    continuing_compound_statement: $ => seq(
      "{", repeat($._statement), optional($.break_if_statement), "}"
    ),

    return_statement: $ => seq("return", optional($._expression)),

    discard_statement: _ => seq("discard", ";"),

    variable_statement: $ => choice(
      $.variable_declaration,
      seq($.variable_declaration, "=", $._expression),
      seq(choice("let", "const"), choice($.identifier, $.variable_identifier_declaration), "=", $._expression,)
    ),

    variable_declaration: $ =>
      seq("var", optional($.variable_qualifier), choice($.identifier, $.variable_identifier_declaration)),

    variable_qualifier: $ => seq(
      "<",
      $.address_space,
      optional(seq(",", $.access_mode)),
      ">"
    ),

    variable_identifier_declaration: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $.type_declaration)
    ),

    increment_statement: $ => seq($.lhs_expression, "++"),

    decrement_statement: $ => seq($.lhs_expression, "--"),

    // EXPRESSIONS

    _expression: $ => choice(
      $.const_literal,
      $.parenthesized_expression,
      $.type_constructor_or_function_call_expression,
      $.composite_value_decomposition_expression,
      $.bitcast_expression,
      $.binary_expression,
      $.unary_expression,
      $.subscript_expression,
      $.identifier,
    ),

    const_literal: $ => choice(
      $.int_literal,
      $.float_literal,
      $.bool_literal,
    ),

    int_literal: _ => /(-?0[xX][0-9a-fA-F]+|0|-?[1-9][0-9]*)[iu]?/,

    float_literal: _ => choice(
      /(-?(([0-9]*\.[0-9]+|[0-9]+\.[0-9]*)([eE](\+|-)?[0-9]+)?)|([0-9]+[eE](\+|-)?[0-9]+))f?|0f|-?[1-9][0-9]*f/,
      /-?0[xX]((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)([pP](\+|-)?[0-9]+f?)?)|([0-9a-fA-F]+[pP](\+|-)?[0-9]+f?))/
    ),

    bool_literal: _ => choice("true", "false"),

    parenthesized_expression: $ => seq("(", $._expression, ")"),

    value_constructor: $ => choice(
      $.builtin_type,
      $.composite_type,
      $._abstract_type,
      "array",
    ),

    type_constructor_or_function_call_expression: $ => seq(
      choice(
        $.value_constructor,
        $.identifier,
      ),
      $.argument_list_expression
    ),

    builtin_type: _ => choice(
      "bool",
      "u32",
      "i32",
      "f32",
      "f16",
      "vec2i",
      "vec3i",
      "vec4i",
      "vec2u",
      "vec3u",
      "vec4u",
      "vec2f",
      "vec3f",
      "vec4f",
      "vec2h",
      "vec3h",
      "vec4h",
      "mat2x2f",
      "mat2x3f",
      "mat2x4f",
      "mat3x2f",
      "mat3x3f",
      "mat3x4f",
      "mat4x2f",
      "mat4x3f",
      "mat4x4f",
      "mat2x2h",
      "mat2x3h",
      "mat2x4h",
      "mat3x2h",
      "mat3x3h",
      "mat3x4h",
      "mat4x2h",
      "mat4x3h",
      "mat4x4h",
    ),

    composite_type: $ => choice(
      seq(choice(
        $._abstract_type,
        "atomic"
      ), "<", $.type_declaration, ">"),
      seq(
        "array",
        "<",
        $.type_declaration,
        optional(seq(",", choice($.int_literal, $.identifier))),
        ">"
      ),
      seq("ptr", "<", $.address_space, ",", $.type_declaration, optional(seq(",", $.access_mode)), ">"),
      "sampler",
      "sampler_comparison",
      ...["2d", "2d_array", "cube", "cube_array", "multisampled_2d"]
        .map(s => "texture_depth_" + s),
      ...["1d", "2d", "2d_array", "3d", "cube", "cube_array", "multisampled_2d"]
        .map(s => "texture_" + s)
        .map(t => withTypeParameter($, t, choice("f16", "f32", "i32", "u32"))),
      ...["1d", "2d", "2d_array", "3d"]
        .map(s => "texture_storage_" + s)
        .map(t => seq(t, "<", $.texel_format, ",", $.access_mode, ">")),
    ),

    type_declaration: $ => choice(
      $.builtin_type,
      $.composite_type,
      $.identifier,
    ),

    _vec_prefix: _ => choice(
      "vec2",
      "vec3",
      "vec4",
    ),

    _mat_prefix: _ => choice(
      "mat2x2",
      "mat2x3",
      "mat2x4",
      "mat3x2",
      "mat3x3",
      "mat3x4",
      "mat4x2",
      "mat4x3",
      "mat4x4",
    ),

    _abstract_type: $ => choice($._vec_prefix, $._mat_prefix),

    texel_format: _ => choice(
      ...["unorm", "snorm", "uint", "sint"].map(s => "rgba8" + s),
      ...cartesianProduct(["rgba16", "r32", "rg32", "rgba32"], ["uint", "sint", "float"]).map(([t, s]) => t + s)
    ),

    address_space: _ => choice("function", "private", "workgroup", "uniform", "storage", "handle"),

    access_mode: _ => choice("read", "write", "read_write"),

    argument_list_expression: $ => seq(
      "(",
      optional(
        seq(
          repeat(
            seq(
              $._expression,
              ","
            )
          ),
          $._expression,
          optional(",")
        ),
      ),
      ")"
    ),

    bitcast_expression: $ => seq(
      "bitcast", "<", $.type_declaration, ">", $.parenthesized_expression
    ),

    binary_expression: $ => choice(
      ...[
        { op: "||", p: PREC.OR },
        { op: "&&", p: PREC.AND },
        { op: "|", p: PREC.BIT_OR },
        { op: "^", p: PREC.BIT_XOR },
        { op: "&", p: PREC.BIT_AND },
        { op: "==", p: PREC.EQ },
        { op: "!=", p: PREC.EQ },
        { op: "<", p: PREC.CMP },
        { op: ">", p: PREC.CMP },
        { op: "<=", p: PREC.CMP },
        { op: ">=", p: PREC.CMP },
        { op: "<<", p: PREC.SHIFT },
        { op: ">>", p: PREC.SHIFT },
        { op: "+", p: PREC.ADD },
        { op: "-", p: PREC.ADD },
        { op: "*", p: PREC.MUL },
        { op: "/", p: PREC.MUL },
        { op: "%", p: PREC.MUL },
      ].map(({ op, p }) => prec.left(p, seq(field("left", $._expression), op, field("right", $._expression)))),
    ),

    unary_expression: $ => prec.left(PREC.UNARY,
      seq(
        choice("-", "!", "~", "*", "&"),
        field("argument", $._expression)
      )
    ),

    postfix_expression: $ => prec.left(PREC.UNARY, seq( // TODO consider replacing the subscript_expression and composite_value_decomposition_expression
      choice(
        seq("[", $._expression, "]", optional($.postfix_expression)),
        seq(".", $.identifier, optional($.postfix_expression))
      ),
      optional($.postfix_expression)
    )),

    subscript_expression: $ => prec(PREC.UNARY, seq(
      field("value", $._expression), "[", field("subscript", $._expression), "]"
    )),

    lhs_expression: $ => seq(
      repeat(choice("*", "&")),
      choice(
        $.identifier,
        seq("(", $.lhs_expression, ")")
      ),
      optional($.postfix_expression)
    ),

    composite_value_decomposition_expression: $ => prec(PREC.UNARY, seq(
      field("value", $._expression), ".", field("accessor", $.identifier)
    ))
  }
})

/**
 * @param {GrammarSymbols<"source_file" | "line_comment" | "_declaration" | "global_variable_declaration" | "global_constant_declaration" | "type_alias_declaration" | "function_declaration" | "function_return_type_declaration" | "struct_declaration" | "struct_member" | "enable_directive" | "attribute" | "_literal_or_identifier" | "identifier" | "parameter_list" | "parameter" | "_statement" | "compound_statement" | "assignment_statement" | "compound_assignment_operator" | "if_statement" | "else_statement" | "switch_statement" | "switch_body" | "_case_label" | "case_selectors" | "case_compound_statement" | "fallthrough_statement" | "loop_statement" | "for_statement" | "for_header" | "while_statement" | "break_statement" | "break_if_statement" | "continue_statement" | "continuing_statement" | "continuing_compound_statement" | "return_statement" | "discard_statement" | "variable_statement" | "variable_declaration" | "variable_qualifier" | "variable_identifier_declaration" | "increment_statement" | "decrement_statement" | "_expression" | "const_literal" | "int_literal" | "float_literal" | "bool_literal" | "parenthesized_expression" | "value_constructor" | "type_constructor_or_function_call_expression" | "builtin_type" | "composite_type" | "type_declaration" | "_vec_prefix" | "_mat_prefix" | "_abstract_type" | "texel_format" | "address_space" | "access_mode" | "argument_list_expression" | "bitcast_expression" | "binary_expression" | "unary_expression" | "postfix_expression" | "subscript_expression" | "lhs_expression" | "composite_value_decomposition_expression">} $
 * @param {RuleOrLiteral} type
 * @param {ChoiceRule} allowed_type_params
 */
function withTypeParameter($, type, allowed_type_params) {
  const type_param = allowed_type_params ?? $.type_declaration
  return seq(type, "<", type_param, ">");
}

/**
 * @param {string[][]} lists
 */
function cartesianProduct(...lists) {
  return lists.reduce((as, bs) => as.flatMap(a => bs.map(b => [a, b].flat())))
}
