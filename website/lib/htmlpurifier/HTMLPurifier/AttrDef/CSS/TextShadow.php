<?php

/**
 * Validates the value for the CSS property text-shadow
 */
class HTMLPurifier_AttrDef_CSS_TextShadow extends HTMLPurifier_AttrDef
{

    protected $color_validator;
    protected $length_validator;

    /**
     * @param string $string
     * @param HTMLPurifier_Config $config
     * @param HTMLPurifier_Context $context
     * @return bool|string
     */
    public function validate($string, $config, $context)
    {
        if (!$this->color_validator) {
            $this->color_validator = new HTMLPurifier_AttrDef_CSS_Color();
        }
        if (!$this->length_validator) {
            $this->length_validator = new HTMLPurifier_AttrDef_CSS_Length();
        }

        $string = strtolower($this->parseCDATA($string));

        if ($string === 'none') {
            return $string;
        }

        $shadows = explode(',', $string);
        $final_shadows = [];
        foreach ($shadows as $shadow) {
            $parts = explode(' ', rtrim($shadow));

            $color = $this->color_validator->validate($parts[0], $config, $context);
            if ($color) {
                array_shift($parts);
            }

            $offset_x = $this->length_validator->validate(array_shift($parts), $config, $context);
            $offset_y = $this->length_validator->validate(array_shift($parts), $config, $context);
            if ($offset_x === false || $offset_y === false) {
                continue;
            }

            $blur_radius = $this->length_validator->validate($parts[0], $config, $context);
            if ($blur_radius !== false) {
                array_shift($parts);
            } else {
                $blur_radius = 0;
            }

            if (!isset($parts[0])) return false;
            if (!$color) {
                $color = $this->color_validator->validate($parts[0], $config, $context) ?: "";
            }

            $final_shadows[] = "$offset_x $offset_y $blur_radius $color";
        }
        if (count($final_shadows) === 0) {
            return false;
        }

        return implode(',', $final_shadows);
    }
}

// vim: et sw=4 sts=4
