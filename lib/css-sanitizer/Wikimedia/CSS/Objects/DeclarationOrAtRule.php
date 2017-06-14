<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Exists because DeclarationOrAtRuleList needs to be able to contain both Declarations
 * and AtRules.
 */
interface DeclarationOrAtRule extends CSSObject {
}
