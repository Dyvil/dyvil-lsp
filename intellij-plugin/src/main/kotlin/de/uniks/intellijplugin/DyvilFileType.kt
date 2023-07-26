package de.uniks.intellijplugin

import com.intellij.icons.AllIcons
import com.intellij.openapi.fileTypes.LanguageFileType
import javax.swing.Icon

object DyvilFileType : LanguageFileType(DyvilLanguage) {
  override fun getName(): String {
    return "Dyvil File"
  }

  override fun getDescription(): String {
    return "Dyvil language file"
  }

  override fun getDefaultExtension(): String {
    return "dyv"
  }

  override fun getIcon(): Icon {
    return AllIcons.Nodes.Lambda
  }
}
