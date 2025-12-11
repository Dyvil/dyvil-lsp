package org.dyvil

import com.intellij.execution.ExecutionException
import com.intellij.lang.javascript.service.JSLanguageServiceUtil
import org.jetbrains.plugins.textmate.api.TextMateBundleProvider
import kotlin.io.path.Path

class DyvilTextmateBundleProvider : TextMateBundleProvider {
  override fun getBundles(): List<TextMateBundleProvider.PluginBundle> {
    val dir = JSLanguageServiceUtil.getPluginDirectory(javaClass, "textmate")
    if (dir == null || !dir.exists()) {
      throw ExecutionException("Plugin Bundle not found")
    }
    return listOf(TextMateBundleProvider.PluginBundle("Dyvil", Path(dir.path)))
  }
}
